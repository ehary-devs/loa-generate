import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const salt = bcrypt.genSaltSync(10)
  const hash = bcrypt.hashSync('admin123', salt)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@stekom.ac.id' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@stekom.ac.id',
      password: hash,
      isSuperAdmin: true,
    },
  })
  
  console.log({ admin })
  
  // Seed initial Journals if not exist
  const existingJtik = await prisma.journal.findUnique({ where: { code: 'JTIK' }})
  if (!existingJtik) {
    const jtik = await prisma.journal.create({
      data: {
        code: "JTIK",
        name: "Jurnal Teknologi Informasi dan Komunikasi",
        nameEn: "Journal of Information and Communication Technology",
        issn: "2723-1178 (online)",
        pattern: "{n:3}/LOA/JTIK/{bulan_romawi}/{tahun}",
        reset: "yearly",
        counter: 23,
      }
    })
    
    // Seed initial Issues
    await prisma.issue.createMany({
      data: [
        { journalId: jtik.id, volume: 12, number: 2, year: 2026, label: "Juli–Desember 2026", status: "open" },
        { journalId: jtik.id, volume: 13, number: 1, year: 2027, label: "Januari–Juni 2027", status: "planned" },
      ]
    })
    
    // Seed Signers
    await prisma.signer.createMany({
      data: [
        { journalId: jtik.id, name: "Dr. Arif Nugroho, S.Kom., M.Kom.", position: "Editor in Chief" },
        { journalId: jtik.id, name: "Rizky Pratama, M.Kom.", position: "Managing Editor" },
      ]
    })
    
    // Assign admin to JTIK
    await prisma.journalUser.create({
      data: {
        userId: admin.id,
        journalId: jtik.id,
        role: 'journal_owner'
      }
    })
    
    console.log("Seeded JTIK")
  }
  
  const existingJmbd = await prisma.journal.findUnique({ where: { code: 'JMBD' }})
  if (!existingJmbd) {
    const jmbd = await prisma.journal.create({
      data: {
        code: "JMBD",
        name: "Jurnal Manajemen dan Bisnis Digital",
        nameEn: "Journal of Management and Digital Business",
        issn: "2809-4417 (online)",
        pattern: "LOA-{tahun}{n:4}-JMBD",
        reset: "yearly",
        counter: 30,
      }
    })
    
    await prisma.issue.createMany({
      data: [
        { journalId: jmbd.id, volume: 7, number: 1, year: 2026, label: "Semester I 2026", status: "closed" },
      ]
    })
    
    await prisma.signer.createMany({
      data: [
        { journalId: jmbd.id, name: "Dr. Hesti Maharani, S.E., M.M.", position: "Ketua Dewan Editor" },
      ]
    })
    console.log("Seeded JMBD")
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
