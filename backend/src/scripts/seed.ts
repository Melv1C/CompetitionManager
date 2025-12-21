import { auth } from '@/lib/auth';
import { env } from '@/lib/env';
import { prisma } from '@/lib/prisma';
import { UserRole$ } from '@repo/core/schemas';

// Data imports
import categoriesData from '@/data/categories.json';
import clubsData from '@/data/clubs.json';
import eventsData from '@/data/events.json';
import mockAthletesData from '@/data/mock-athletes.json';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const isDevelopment = env.NODE_ENV === 'development';

// Mock users for development (hard-coded)
const MOCK_ADMIN = {
  name: 'Admin',
  email: 'admin@example.com',
  password: 'Admin123!',
};

const MOCK_USER = {
  name: 'User',
  email: 'user@example.com',
  password: 'User123!',
};

// ---------------------------------------------------------------------------
// Seed Result Types
// ---------------------------------------------------------------------------

interface SeedCounts {
  created: number;
  skipped: number;
}

interface SeedResult {
  events: SeedCounts;
  categories: SeedCounts;
  clubs: SeedCounts;
  athletes: SeedCounts;
  users: SeedCounts;
}

// ---------------------------------------------------------------------------
// Console Output Helpers
// ---------------------------------------------------------------------------

const log = {
  info: (msg: string) => console.log(msg),
  success: (msg: string) => console.log(`✅ ${msg}`),
  warning: (msg: string) => console.log(`⚠️  ${msg}`),
  error: (msg: string) => console.error(`❌ ${msg}`),
  section: (msg: string, created: number, skipped: number) =>
    console.log(`📦 ${msg}... ${created} created, ${skipped} skipped`),
};

// ---------------------------------------------------------------------------
// Seed Functions
// ---------------------------------------------------------------------------

async function seedEvents(): Promise<SeedCounts> {
  let created = 0;
  let skipped = 0;

  for (const eventData of eventsData) {
    if (!eventData.name || !eventData.abbr || !eventData.type || !eventData.group) {
      log.warning(`Skipping incomplete event entry: ${JSON.stringify(eventData)}`);
      skipped++;
      continue;
    }

    const existingEvent = await prisma.event.findUnique({
      where: { name: eventData.name },
    });

    if (existingEvent) {
      skipped++;
      continue;
    }

    await prisma.event.create({
      data: {
        name: eventData.name,
        abbr: eventData.abbr,
        type: eventData.type,
        group: eventData.group,
      },
    });
    created++;
  }

  return { created, skipped };
}

async function seedCategories(): Promise<SeedCounts> {
  let created = 0;
  let skipped = 0;

  for (const categoryData of categoriesData) {
    if (!categoryData.name || !categoryData.abbr) {
      log.warning(`Skipping incomplete category entry: ${JSON.stringify(categoryData)}`);
      skipped++;
      continue;
    }

    const existingCategory = await prisma.category.findUnique({
      where: { name: categoryData.name },
    });

    if (existingCategory) {
      skipped++;
      continue;
    }

    await prisma.category.create({
      data: {
        name: categoryData.name,
        abbr: categoryData.abbr,
        baseCategory: categoryData.baseCategory,
        abbrBaseCategory: categoryData.abbrBaseCategory,
        gender: categoryData.gender,
        masterAgeGroup: categoryData.masterAgeGroup || null,
        order: categoryData.order,
        amId: categoryData.amId,
      },
    });
    created++;
  }

  return { created, skipped };
}

async function seedClubs(): Promise<SeedCounts> {
  let created = 0;
  let skipped = 0;

  for (const clubData of clubsData) {
    if (!clubData.name || !clubData.abbr) {
      log.warning(`Skipping incomplete club entry: ${JSON.stringify(clubData)}`);
      skipped++;
      continue;
    }

    const existingClub = await prisma.club.findUnique({
      where: { abbr: clubData.abbr },
    });

    if (existingClub) {
      skipped++;
      continue;
    }

    await prisma.club.create({
      data: {
        name: clubData.name,
        abbr: clubData.abbr,
        country: clubData.country || null,
      },
    });
    created++;
  }

  return { created, skipped };
}

async function seedMockAthletes(): Promise<SeedCounts> {
  let created = 0;
  let skipped = 0;

  const currentSeason = new Date().getFullYear();

  for (const athleteData of mockAthletesData) {
    if (
      !athleteData.license ||
      !athleteData.firstName ||
      !athleteData.lastName ||
      !athleteData.gender ||
      !athleteData.birthdate ||
      !athleteData.clubAbbr
    ) {
      log.warning(`Skipping incomplete athlete entry: ${JSON.stringify(athleteData)}`);
      skipped++;
      continue;
    }

    // Find the club by abbreviation
    const club = await prisma.club.findUnique({
      where: { abbr: athleteData.clubAbbr },
    });

    if (!club) {
      log.warning(
        `Club not found for athlete ${athleteData.firstName} ${athleteData.lastName}: ${athleteData.clubAbbr}`,
      );
      skipped++;
      continue;
    }

    // Check if athlete already exists by license (without competitionId = global athlete)
    const existingAthlete = await prisma.athlete.findFirst({
      where: { license: athleteData.license, competitionId: null },
      include: { athleteInfo: { where: { season: currentSeason } } },
    });

    if (existingAthlete) {
      // Check if current season info exists
      if (existingAthlete.athleteInfo.length === 0) {
        // Create athlete info for current season
        await prisma.athleteInfo.create({
          data: {
            athleteId: existingAthlete.id,
            season: currentSeason,
            clubId: club.id,
            bib: athleteData.bib,
          },
        });
      }
      skipped++;
      continue;
    }

    // Create new athlete with season info
    await prisma.athlete.create({
      data: {
        license: athleteData.license,
        firstName: athleteData.firstName,
        lastName: athleteData.lastName,
        gender: athleteData.gender,
        birthdate: new Date(athleteData.birthdate),
        athleteInfo: {
          create: {
            season: currentSeason,
            clubId: club.id,
            bib: athleteData.bib,
          },
        },
      },
    });
    created++;
  }

  return { created, skipped };
}

async function seedMockUsers(): Promise<SeedCounts> {
  let created = 0;
  let skipped = 0;

  // Seed admin user
  const existingAdmin = await prisma.user.findUnique({
    where: { email: MOCK_ADMIN.email },
  });

  if (existingAdmin) {
    skipped++;
  } else {
    try {
      const result = await auth.api.signUpEmail({
        body: {
          name: MOCK_ADMIN.name,
          email: MOCK_ADMIN.email,
          password: MOCK_ADMIN.password,
        },
      });

      if (result.user) {
        await prisma.user.update({
          where: { id: result.user.id },
          data: {
            role: UserRole$.enum.admin,
            emailVerified: true,
          },
        });
        log.info(`  Created admin user: ${MOCK_ADMIN.email}`);
        created++;
      }
    } catch (error) {
      log.warning(
        `Failed to create admin user: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  // Seed regular user
  const existingUser = await prisma.user.findUnique({
    where: { email: MOCK_USER.email },
  });

  if (existingUser) {
    skipped++;
  } else {
    try {
      const result = await auth.api.signUpEmail({
        body: {
          name: MOCK_USER.name,
          email: MOCK_USER.email,
          password: MOCK_USER.password,
        },
      });

      if (result.user) {
        await prisma.user.update({
          where: { id: result.user.id },
          data: {
            role: UserRole$.enum.user,
            emailVerified: true,
          },
        });
        log.info(`  Created regular user: ${MOCK_USER.email}`);
        created++;
      }
    } catch (error) {
      log.warning(
        `Failed to create regular user: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  return { created, skipped };
}

// ---------------------------------------------------------------------------
// Main Seed Function
// ---------------------------------------------------------------------------

async function seed(): Promise<void> {
  log.info('🌱 Starting database seed...');
  log.info(`   Environment: ${env.NODE_ENV}`);
  log.info('');

  const result: SeedResult = {
    events: { created: 0, skipped: 0 },
    categories: { created: 0, skipped: 0 },
    clubs: { created: 0, skipped: 0 },
    athletes: { created: 0, skipped: 0 },
    users: { created: 0, skipped: 0 },
  };

  try {
    // Seed clubs first (required for athletes)
    result.clubs = await seedClubs();
    log.section('Seeding clubs', result.clubs.created, result.clubs.skipped);

    // Seed events
    result.events = await seedEvents();
    log.section('Seeding events', result.events.created, result.events.skipped);

    // Seed categories
    result.categories = await seedCategories();
    log.section('Seeding categories', result.categories.created, result.categories.skipped);

    // Development-only seeding
    if (isDevelopment) {
      log.info('');
      log.info('🔧 Development mode: seeding mock data...');

      // Seed mock athletes
      result.athletes = await seedMockAthletes();
      log.section('Seeding mock athletes', result.athletes.created, result.athletes.skipped);

      // Seed mock users
      result.users = await seedMockUsers();
      log.section('Seeding mock users', result.users.created, result.users.skipped);
    }

    log.info('');
    log.success('Database seed completed successfully!');
  } catch (error) {
    log.error('Database seed failed!');
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Entry Point
// ---------------------------------------------------------------------------

seed()
  .then(() => {
    process.exit(0);
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
