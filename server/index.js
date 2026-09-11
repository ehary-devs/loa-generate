import express from 'express';
import http from 'http';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { generateToken, verifyToken, requireSuperAdmin } from './auth.js';

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// Auto-seed admin user and default journals if DB is empty
async function ensureDefaultData() {
  try {
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      console.log('Database empty. Running auto-seed for default admin & journals...');
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync('admin123', salt);

      const admin = await prisma.user.create({
        data: {
          name: 'Super Admin',
          email: 'admin@stekom.ac.id',
          password: hash,
          isSuperAdmin: true,
        }
      });

      await prisma.journal.create({
        data: {
          code: "JTIK",
          name: "Jurnal Teknologi Informasi dan Komunikasi",
          nameEn: "Journal of Information and Communication Technology",
          issn: "2723-1178 (online)",
          pattern: "{n:3}/LOA/JTIK/{bulan_romawi}/{tahun}",
          reset: "yearly",
          counter: 23,
          issues: {
            create: [
              { volume: 12, number: 2, year: 2026, label: "Juli–Desember 2026", status: "open" },
              { volume: 13, number: 1, year: 2027, label: "Januari–Juni 2027", status: "planned" }
            ]
          },
          signers: {
            create: [
              { name: "Dr. Arif Nugroho, S.Kom., M.Kom.", position: "Editor in Chief" },
              { name: "Rizky Pratama, M.Kom.", position: "Managing Editor" }
            ]
          },
          users: {
            create: [
              { userId: admin.id, role: 'journal_owner' }
            ]
          }
        }
      });

      await prisma.journal.create({
        data: {
          code: "JMBD",
          name: "Jurnal Manajemen dan Bisnis Digital",
          nameEn: "Journal of Management and Digital Business",
          issn: "2809-4417 (online)",
          pattern: "LOA-{tahun}{n:4}-JMBD",
          reset: "yearly",
          counter: 30,
          issues: {
            create: [
              { volume: 7, number: 1, year: 2026, label: "Semester I 2026", status: "closed" }
            ]
          },
          signers: {
            create: [
              { name: "Dr. Hesti Maharani, S.E., M.M.", position: "Ketua Dewan Editor" }
            ]
          },
          users: {
            create: [
              { userId: admin.id, role: 'journal_owner' }
            ]
          }
        }
      });
      console.log('Auto-seed completed successfully.');
    }
  } catch (err) {
    console.error('Auto-seed check error:', err);
  }
}

// Auth
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  let user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    await ensureDefaultData();
    user = await prisma.user.findUnique({ where: { email } });
  }

  if (!user) {
    return res.status(401).json({ error: 'Email atau kata sandi tidak valid' });
  }
  
  const isValid = bcrypt.compareSync(password, user.password);
  if (!isValid) {
    return res.status(401).json({ error: 'Email atau kata sandi tidak valid' });
  }

  const token = generateToken(user);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, isSuperAdmin: user.isSuperAdmin } });
});

app.get('/api/me', verifyToken, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, name: user.name, email: user.email, isSuperAdmin: user.isSuperAdmin });
});

// User Management (Super Admin only)
app.get('/api/users', verifyToken, requireSuperAdmin, async (req, res) => {
  const users = await prisma.user.findMany({
    select: { 
      id: true, 
      name: true, 
      email: true, 
      isSuperAdmin: true,
      journals: {
        select: {
          role: true,
          journal: {
            select: { id: true, code: true, name: true }
          }
        }
      }
    },
    orderBy: { id: 'asc' }
  });
  res.json(users);
});

app.post('/api/users', verifyToken, requireSuperAdmin, async (req, res) => {
  const { name, email, password, isSuperAdmin, journalAssignments } = req.body;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(400).json({ error: 'Email sudah terdaftar' });
  }

  try {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const newUser = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: { name, email, password: hash, isSuperAdmin: !!isSuperAdmin }
      });

      if (Array.isArray(journalAssignments) && journalAssignments.length > 0) {
        await tx.journalUser.createMany({
          data: journalAssignments.map(j => ({
            userId: created.id,
            journalId: Number(j.journalId),
            role: j.role || 'journal_editor'
          }))
        });
      }

      return created;
    });

    res.json({ id: newUser.id, name: newUser.name, email: newUser.email, isSuperAdmin: newUser.isSuperAdmin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal membuat pengguna' });
  }
});

app.put('/api/users/:id', verifyToken, requireSuperAdmin, async (req, res) => {
  const { id } = req.params;
  const targetId = Number(id);
  const { name, email, password, isSuperAdmin, journalAssignments } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { id: targetId } });
    if (!existingUser) {
      return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
    }

    if (email && email !== existingUser.email) {
      const emailCheck = await prisma.user.findUnique({ where: { email } });
      if (emailCheck) {
        return res.status(400).json({ error: 'Email sudah digunakan oleh pengguna lain' });
      }
    }

    const dataToUpdate = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (email !== undefined) dataToUpdate.email = email;
    if (isSuperAdmin !== undefined) dataToUpdate.isSuperAdmin = Boolean(isSuperAdmin);

    if (password && password.trim()) {
      const salt = bcrypt.genSaltSync(10);
      dataToUpdate.password = bcrypt.hashSync(password.trim(), salt);
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: targetId },
        data: dataToUpdate,
        select: { id: true, name: true, email: true, isSuperAdmin: true }
      });

      if (Array.isArray(journalAssignments)) {
        await tx.journalUser.deleteMany({ where: { userId: targetId } });

        if (journalAssignments.length > 0) {
          await tx.journalUser.createMany({
            data: journalAssignments.map(j => ({
              userId: targetId,
              journalId: Number(j.journalId),
              role: j.role || 'journal_editor'
            }))
          });
        }
      }

      return updated;
    });

    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memperbarui pengguna' });
  }
});

app.delete('/api/users/:id', verifyToken, requireSuperAdmin, async (req, res) => {
  const { id } = req.params;
  const targetId = Number(id);

  if (req.user.id === targetId) {
    return res.status(400).json({ error: 'Anda tidak dapat menghapus akun Anda sendiri' });
  }

  try {
    const targetUser = await prisma.user.findUnique({ where: { id: targetId } });
    if (!targetUser) {
      return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
    }

    // Delete associated journalUser records first
    await prisma.journalUser.deleteMany({ where: { userId: targetId } });

    await prisma.user.delete({ where: { id: targetId } });
    res.json({ success: true, message: 'Pengguna berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Terjadi kesalahan saat menghapus pengguna' });
  }
});

app.post('/api/journal-users', verifyToken, requireSuperAdmin, async (req, res) => {
  const { userId, journalId, role } = req.body;
  await prisma.journalUser.upsert({
    where: { userId_journalId: { userId: Number(userId), journalId: Number(journalId) } },
    update: { role },
    create: { userId: Number(userId), journalId: Number(journalId), role }
  });
  res.json({ success: true });
});

// Journals
app.get('/api/journals', verifyToken, async (req, res) => {
  let journals = [];
  if (req.user.isSuperAdmin) {
    journals = await prisma.journal.findMany({
      include: { issues: true, signers: true, users: { include: { user: true } } }
    });
  } else {
    journals = await prisma.journal.findMany({
      where: { users: { some: { userId: req.user.id } } },
      include: { issues: true, signers: true, users: { include: { user: true } } }
    });
  }
  
  // Format matching the expected frontend structure
  const result = journals.map(j => ({
    ...j,
    members: j.users.map(ju => `${ju.user.name} (${ju.role})`)
  }));

  res.json(result);
});

app.post('/api/journals', verifyToken, requireSuperAdmin, async (req, res) => {
  const { name, nameEn, code, issn } = req.body;
  const newJournal = await prisma.journal.create({
    data: {
      name,
      nameEn,
      code,
      issn,
      counter: 0,
      pattern: `LOA-{tahun}{n:4}-${code}`
    }
  });
  res.json(newJournal);
});

app.put('/api/journals/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { name, nameEn, code, issn, pattern, reset, counter } = req.body;
  try {
    const dataToUpdate = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (nameEn !== undefined) dataToUpdate.nameEn = nameEn;
    if (code !== undefined) dataToUpdate.code = code;
    if (issn !== undefined) dataToUpdate.issn = issn;
    if (pattern !== undefined) dataToUpdate.pattern = pattern;
    if (reset !== undefined) dataToUpdate.reset = reset;
    if (counter !== undefined) dataToUpdate.counter = Number(counter);

    const updated = await prisma.journal.update({
      where: { id: Number(id) },
      data: dataToUpdate
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(404).json({ error: 'Jurnal tidak ditemukan' });
  }
});

app.delete('/api/journals/:id', verifyToken, requireSuperAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.journal.delete({ where: { id: Number(id) } });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Gagal menghapus jurnal (mungkin masih ada data terkait)' });
  }
});

// SIGNERS
app.post('/api/signers', verifyToken, async (req, res) => {
  const { journalId, name, position, signatureImage } = req.body;
  if (!journalId || !name || !position) {
    return res.status(400).json({ error: 'Nama, jabatan, dan ID jurnal wajib diisi.' });
  }

  try {
    const signer = await prisma.signer.create({
      data: {
        journalId: Number(journalId),
        name,
        position,
        signatureImage: signatureImage || null,
      },
    });
    res.json(signer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menambah penandatangan.' });
  }
});

app.put('/api/signers/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { name, position, signatureImage } = req.body;

  try {
    const updated = await prisma.signer.update({
      where: { id: Number(id) },
      data: {
        name,
        position,
        ...(signatureImage !== undefined ? { signatureImage } : {}),
      },
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(404).json({ error: 'Penandatangan tidak ditemukan.' });
  }
});

app.delete('/api/signers/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const signer = await prisma.signer.findUnique({
      where: { id: Number(id) },
    });

    if (!signer) {
      return res.status(404).json({ error: 'Penandatangan tidak ditemukan.' });
    }

    // Check if signer has signed any LOA
    const count = await prisma.loa.count({
      where: { signerId: Number(id) },
    });

    if (count > 0) {
      return res.status(400).json({
        error: `Penandatangan "${signer.name}" sedang digunakan oleh ${count} LOA dan tidak dapat dihapus.`,
        count,
      });
    }

    await prisma.signer.delete({
      where: { id: Number(id) },
    });

    res.json({ success: true, message: 'Penandatangan berhasil dihapus.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Terjadi kesalahan saat menghapus penandatangan.' });
  }
});


// LOAs
app.get('/api/loas', verifyToken, async (req, res) => {
  // Only return LOAs for journals the user has access to
  let loas = [];
  if (req.user.isSuperAdmin) {
    loas = await prisma.loa.findMany({
      orderBy: { id: 'desc' }
    });
  } else {
    loas = await prisma.loa.findMany({
      where: {
        journal: {
          users: { some: { userId: req.user.id } }
        }
      },
      orderBy: { id: 'desc' }
    });
  }
  res.json(loas);
});

app.post('/api/loas', verifyToken, async (req, res) => {
  const payload = req.body;
  
  // Update journal counter and insert loa in transaction
  const result = await prisma.$transaction(async (tx) => {
    if (payload.sequence) {
      await tx.journal.update({
        where: { id: payload.journalId },
        data: { counter: payload.sequence }
      });
    }
    
    // Create LOA
    return await tx.loa.create({
      data: {
        number: payload.number,
        token: payload.token,
        title: payload.title,
        authors: payload.authors,
        language: payload.language,
        status: payload.status,
        hash: payload.hash,
        acceptedDate: payload.acceptedDate,
        letterDate: payload.letterDate,
        sequence: payload.sequence,
        journalId: payload.journalId,
        issueId: payload.issueId,
        signerId: payload.signerId
      }
    });
  });

  res.json(result);
});

app.put('/api/loas/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const payload = req.body;
  
  try {
    const updated = await prisma.loa.update({
      where: { id: Number(id) },
      data: {
        title: payload.title,
        authors: payload.authors,
        acceptedDate: payload.acceptedDate,
        letterDate: payload.letterDate,
        language: payload.language,
        issueId: payload.issueId,
        signerId: payload.signerId
      }
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Gagal mengupdate LOA' });
  }
});

app.put('/api/loas/:id/revoke', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  
  try {
    const loa = await prisma.loa.update({
      where: { id: Number(id) },
      data: { status: 'revoked', revokeReason: reason }
    });
    res.json(loa);
  } catch (err) {
    res.status(404).json({ error: 'LOA not found' });
  }
});

// Issues CRUD
app.post('/api/issues', verifyToken, async (req, res) => {
  const { volume, number, year, label, status, journalId } = req.body;
  try {
    const issue = await prisma.issue.create({
      data: {
        volume: Number(volume),
        number: Number(number),
        year: Number(year),
        label: label || `Periode ${year}`,
        status: status || 'planned',
        journalId: Number(journalId)
      }
    });
    res.json(issue);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Gagal membuat edisi' });
  }
});

app.put('/api/issues/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { volume, number, year, label, status } = req.body;
  try {
    const issue = await prisma.issue.update({
      where: { id: Number(id) },
      data: {
        volume: Number(volume),
        number: Number(number),
        year: Number(year),
        label,
        status
      }
    });
    res.json(issue);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Gagal mengupdate edisi' });
  }
});

app.delete('/api/issues/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const countLoas = await prisma.loa.count({
      where: { issueId: Number(id) }
    });
    if (countLoas > 0) {
      return res.status(400).json({ error: `Edisi sedang digunakan oleh ${countLoas} LOA dan tidak dapat dihapus.` });
    }
    await prisma.issue.delete({
      where: { id: Number(id) }
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Gagal menghapus edisi' });
  }
});

// Public verification endpoint
app.get('/api/verify/:token', async (req, res) => {
  const token = req.params.token.toUpperCase();
  const loa = await prisma.loa.findUnique({
    where: { token },
    include: { journal: true, signer: true, issue: true }
  });
  
  if (!loa) return res.status(404).json({ error: 'Token not found' });
  
  res.json({
    loa,
    journal: { name: loa.journal.name, issn: loa.journal.issn, nameEn: loa.journal.nameEn },
    signer: loa.signer ? { name: loa.signer.name, position: loa.signer.position } : null,
    issue: loa.issue ? { volume: loa.issue.volume, number: loa.issue.number, year: loa.issue.year } : null
  });
});

// Start server (only in local standalone node environment)
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3010;
  const server = http.createServer(app);
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
