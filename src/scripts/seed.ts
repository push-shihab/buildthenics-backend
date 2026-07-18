import { ObjectId } from 'mongodb';
import { connectDB, getCollection, closeDB } from '../config/db';
import { User, Program } from '../models/types';

async function seed() {
  console.log('Starting database seeding...');
  
  try {
    const db = await connectDB();
    
    const usersCollection = getCollection<User>('users');
    const programsCollection = getCollection<Program>('programs');

    // Clear existing programs
    await programsCollection.deleteMany({});
    console.log('Cleared existing programs.');

    // Check if the default creator user exists, or create one
    let creator = await usersCollection.findOne({ email: 'coach@buildthenics.com' });
    if (!creator) {
      const result = await usersCollection.insertOne({
        name: 'Calisthenics Coach',
        email: 'coach@buildthenics.com',
        avatar: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=200&auto=format&fit=crop',
        goals: ['Build Muscle', 'Learn Skills', 'Improve Mobility'],
        experienceLevel: 'advanced',
        equipment: ['Pull Up Bar', 'Dip Bars', 'Gymnastic Rings', 'Resistance Bands', 'Parallettes'],
        createdAt: new Date()
      });
      creator = await usersCollection.findOne({ _id: result.insertedId });
      console.log('Created default creator user.');
    }

    const creatorId = creator!._id!;

    const programsToSeed: Omit<Program, '_id'>[] = [
      {
        title: 'Handstand Mastery',
        shortDescription: 'Master the art of balancing on your hands with structured alignment and strength drills.',
        fullDescription: 'This comprehensive handstand program is designed to take you from a complete wall-dependent beginner to holding a solid, freestanding 10-second handstand. You will focus on shoulder mobility, core stability, wrist strength, and balance re-balancing mechanics. The workouts are designed to be done 3-4 times per week, starting with joint preparation and progressing to active balance drills.',
        coverImageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop',
        difficulty: 'intermediate',
        category: 'skills',
        durationWeeks: 8,
        equipmentNeeded: ['Parallettes'],
        createdBy: creatorId,
        rating: 4.8,
        createdAt: new Date(),
        exercises: [
          {
            name: 'Wrist Mobility Prep',
            muscleGroup: 'Wrists',
            sets: 3,
            reps: '15 repetitions',
            restSeconds: 30,
            formNotes: 'Roll wrists on the floor in circular motions, stretch fingers forward and backwards.',
            order: 1
          },
          {
            name: 'Chest-to-Wall Handstand Hold',
            muscleGroup: 'Shoulders, Core',
            sets: 4,
            reps: '30-45 seconds',
            restSeconds: 90,
            formNotes: 'Keep your body in a straight line, tuck your pelvis, and push active shoulders high.',
            order: 2
          },
          {
            name: 'Scapular Handstand Push-ups',
            muscleGroup: 'Shoulders',
            sets: 3,
            reps: '10 reps',
            restSeconds: 60,
            formNotes: 'Shrug shoulders up and down while maintaining a hollow body shape against the wall.',
            order: 3
          },
          {
            name: 'Kick-up to Balance Drills',
            muscleGroup: 'Full Body, Balance',
            sets: 5,
            reps: '8 attempts',
            restSeconds: 75,
            formNotes: 'Kick up slowly, control your ascent, and try to tap your toes away from the wall.',
            order: 4
          },
          {
            name: 'Pike Push-ups',
            muscleGroup: 'Shoulders, Triceps',
            sets: 3,
            reps: '8-12 reps',
            restSeconds: 90,
            formNotes: 'Elevate feet if possible, lean forward at the bottom of the movement.',
            order: 5
          }
        ]
      },
      {
        title: 'Planche Progression Foundations',
        shortDescription: 'Build the elite shoulder and core strength needed for the planche static holds.',
        fullDescription: 'The planche is one of the ultimate calisthenics strength feats. This program lays down the foundations by developing extreme scapular protraction and depression strength. You will start with planche leans, move to tuck planche entries, and build supplementary shoulder flexor strength.',
        coverImageUrl: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=800&auto=format&fit=crop',
        difficulty: 'advanced',
        category: 'skills',
        durationWeeks: 12,
        equipmentNeeded: ['Parallettes', 'Resistance Bands'],
        createdBy: creatorId,
        rating: 4.9,
        createdAt: new Date(),
        exercises: [
          {
            name: 'Planche Leans',
            muscleGroup: 'Shoulders, Wrists',
            sets: 4,
            reps: '15-20 seconds',
            restSeconds: 90,
            formNotes: 'Protracted and depressed scapula, lean forward as far as possible, squeeze core.',
            order: 1
          },
          {
            name: 'Band-Assisted Tuck Planche Hold',
            muscleGroup: 'Full Body',
            sets: 4,
            reps: '10-15 seconds',
            restSeconds: 120,
            formNotes: 'Place resistance band around hips, press up into tuck planche, keep arms locked out.',
            order: 2
          },
          {
            name: 'Pseudo Planche Push-ups',
            muscleGroup: 'Shoulders, Chest, Triceps',
            sets: 4,
            reps: '8-10 reps',
            restSeconds: 90,
            formNotes: 'Maintain the lean at the top and bottom of each repetition.',
            order: 3
          },
          {
            name: 'L-Sit to Tuck Planche Transition',
            muscleGroup: 'Core, Shoulders',
            sets: 3,
            reps: '5 repetitions',
            restSeconds: 100,
            formNotes: 'Push down actively, tuck knees close to chest, and swing hips back.',
            order: 4
          }
        ]
      },
      {
        title: 'Front Lever Foundations',
        shortDescription: 'Develop pull-day supremacy and master the front lever holds and pulls.',
        fullDescription: 'A perfect combination of lats, core, and scapular retractors. This program guides you through standard tuck lever holds, advanced tuck holds, one-leg variations, and active front lever raises to target the pulling chain.',
        coverImageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop',
        difficulty: 'intermediate',
        category: 'skills',
        durationWeeks: 10,
        equipmentNeeded: ['Pull Up Bar', 'Resistance Bands'],
        createdBy: creatorId,
        rating: 4.7,
        createdAt: new Date(),
        exercises: [
          {
            name: 'Tuck Front Lever Hold',
            muscleGroup: 'Lats, Core',
            sets: 4,
            reps: '15-20 seconds',
            restSeconds: 90,
            formNotes: 'Keep arms completely straight, pull the bar down to hips, round upper back slightly.',
            order: 1
          },
          {
            name: 'Front Lever Pulls (Tuck)',
            muscleGroup: 'Lats, Shoulders',
            sets: 3,
            reps: '8 reps',
            restSeconds: 90,
            formNotes: 'From a dead hang, pull up into a tuck front lever and lower down with control.',
            order: 2
          },
          {
            name: 'Scapular Pull-ups',
            muscleGroup: 'Upper Back',
            sets: 4,
            reps: '12 reps',
            restSeconds: 60,
            formNotes: 'Keep arms straight, initiate pull using only the shoulder blades.',
            order: 3
          },
          {
            name: 'Hanging Leg Raises',
            muscleGroup: 'Core, Hip Flexors',
            sets: 3,
            reps: '12 reps',
            restSeconds: 60,
            formNotes: 'Tuck pelvis, raise legs slowly without using momentum, touch bar with shins.',
            order: 4
          }
        ]
      },
      {
        title: 'Full-Body Strength Basics',
        shortDescription: 'The entry-point program for absolute beginners to build raw calisthenics strength.',
        fullDescription: 'No equipment? No experience? No problem. This program establishes correct motor patterns for classic calisthenics exercises: the pull-up, push-up, dip, and squat. Ideal for anyone looking to build a lean, strong physique from scratch.',
        coverImageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop',
        difficulty: 'beginner',
        category: 'strength',
        durationWeeks: 6,
        equipmentNeeded: ['Pull Up Bar', 'Dip Bars'],
        createdBy: creatorId,
        rating: 4.6,
        createdAt: new Date(),
        exercises: [
          {
            name: 'Incline Push-ups',
            muscleGroup: 'Chest, Arms',
            sets: 3,
            reps: '12-15 reps',
            restSeconds: 60,
            formNotes: 'Place hands on an elevated surface, keep a straight line from head to heels.',
            order: 1
          },
          {
            name: 'Australian Pull-ups (Rows)',
            muscleGroup: 'Back, Biceps',
            sets: 3,
            reps: '10 reps',
            restSeconds: 75,
            formNotes: 'Hang under a low bar, pull chest to bar while keeping the body rigid.',
            order: 2
          },
          {
            name: 'Bodyweight Squats',
            muscleGroup: 'Quads, Glutes',
            sets: 4,
            reps: '15 reps',
            restSeconds: 60,
            formNotes: 'Sit back into your hips, go below parallel, keep knees aligned with toes.',
            order: 3
          },
          {
            name: 'Plank Hold',
            muscleGroup: 'Abs, Core',
            sets: 3,
            reps: '45 seconds',
            restSeconds: 60,
            formNotes: 'Squeeze glutes, push elbow into the floor, maintain a flat back.',
            order: 4
          }
        ]
      },
      {
        title: 'Military Calisthenics Routine',
        shortDescription: 'High-volume, high-intensity endurance conditioning for rugged durability.',
        fullDescription: 'Based on special forces fitness tests, this workout focuses on muscular endurance, mental grit, and high reps. Push-ups, pull-ups, chin-ups, squats, and lunges are combined in super-sets and pyramids to test your absolute limits.',
        coverImageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop',
        difficulty: 'advanced',
        category: 'strength',
        durationWeeks: 8,
        equipmentNeeded: ['Pull Up Bar', 'Dip Bars'],
        createdBy: creatorId,
        rating: 4.8,
        createdAt: new Date(),
        exercises: [
          {
            name: 'Classic Pull-ups',
            muscleGroup: 'Lats, Upper Back',
            sets: 5,
            reps: '10-15 reps',
            restSeconds: 60,
            formNotes: 'Full range of motion, chin clear of the bar, dead hang at the bottom.',
            order: 1
          },
          {
            name: 'Parallel Bar Dips',
            muscleGroup: 'Chest, Triceps, Shoulders',
            sets: 5,
            reps: '15-20 reps',
            restSeconds: 60,
            formNotes: 'Go down to 90 degrees at the elbow, lock out fully at the top.',
            order: 2
          },
          {
            name: 'Classic Push-ups',
            muscleGroup: 'Chest, Arms',
            sets: 5,
            reps: '25-30 reps',
            restSeconds: 45,
            formNotes: 'Keep chest 1 inch off the ground on each rep, stay tight.',
            order: 3
          },
          {
            name: 'Walking Lunges',
            muscleGroup: 'Legs, Core',
            sets: 4,
            reps: '30 steps',
            restSeconds: 60,
            formNotes: 'Step forward, tap rear knee lightly on floor, maintain upright posture.',
            order: 4
          },
          {
            name: 'Burpees',
            muscleGroup: 'Cardio, Full Body',
            sets: 3,
            reps: '20 reps',
            restSeconds: 90,
            formNotes: 'Jump up with hands raised, drop into push-up position, repeat with speed.',
            order: 5
          }
        ]
      },
      {
        title: 'Iron Core & Rings',
        shortDescription: 'Take your strength to the unstable realm of gymnastic rings.',
        fullDescription: 'Gymnastic rings add an element of instability that forces stabilizer muscles to fire constantly. This intermediate program focuses on developing the support hold, ring dips, ring flys, and aggressive core stabilization routines.',
        coverImageUrl: 'https://images.unsplash.com/photo-1508215885820-4585e56135c8?q=80&w=800&auto=format&fit=crop',
        difficulty: 'intermediate',
        category: 'strength',
        durationWeeks: 8,
        equipmentNeeded: ['Gymnastic Rings'],
        createdBy: creatorId,
        rating: 4.7,
        createdAt: new Date(),
        exercises: [
          {
            name: 'Ring Support Hold',
            muscleGroup: 'Shoulders, Chest, Core',
            sets: 3,
            reps: '30 seconds',
            restSeconds: 60,
            formNotes: 'Turn rings out (RTO), push down hard, keep arms locked and close to body.',
            order: 1
          },
          {
            name: 'Ring Dips',
            muscleGroup: 'Chest, Triceps, Shoulders',
            sets: 4,
            reps: '6-8 reps',
            restSeconds: 90,
            formNotes: 'Control the shaking, lean slightly forward, maintain ring control.',
            order: 2
          },
          {
            name: 'Ring Rollouts',
            muscleGroup: 'Abs, Lower Back',
            sets: 3,
            reps: '10 reps',
            restSeconds: 75,
            formNotes: 'Roll forward with arms straight, tuck pelvis, do not arch lower back.',
            order: 3
          },
          {
            name: 'Ring Rows (L-sit)',
            muscleGroup: 'Back, Abs',
            sets: 3,
            reps: '8 reps',
            restSeconds: 75,
            formNotes: 'Hold an L-sit position while performing horizontal pulling motions.',
            order: 4
          }
        ]
      },
      {
        title: 'Hip & Shoulder Mobility Flow',
        shortDescription: 'Open up tight hips, relieve stiff shoulders, and bulletproof your joints.',
        fullDescription: 'Ideal for athletes of all levels who sit at desks or experience tightness from intense workouts. We target shoulder flexion, extension, internal/external rotation, hip openers, and spine movements to restore optimal range of motion.',
        coverImageUrl: 'https://images.unsplash.com/photo-1603988363607-e1e4a66962c6?q=80&w=800&auto=format&fit=crop',
        difficulty: 'beginner',
        category: 'mobility',
        durationWeeks: 4,
        equipmentNeeded: ['Resistance Bands'],
        createdBy: creatorId,
        rating: 4.5,
        createdAt: new Date(),
        exercises: [
          {
            name: 'Shoulder Pass-throughs',
            muscleGroup: 'Shoulders',
            sets: 3,
            reps: '12 reps',
            restSeconds: 30,
            formNotes: 'Use a wide grip on a band/stick, bring it over the head and behind, keep arms straight.',
            order: 1
          },
          {
            name: '90/90 Hip Switches',
            muscleGroup: 'Hips',
            sets: 3,
            reps: '10 reps per side',
            restSeconds: 45,
            formNotes: 'Keep heels pinned, rotate hips side to side, sit tall, do not collapse posture.',
            order: 2
          },
          {
            name: 'World\'s Greatest Stretch',
            muscleGroup: 'Full Body, Hips, Thoracic Spine',
            sets: 3,
            reps: '5 per side',
            restSeconds: 45,
            formNotes: 'Step forward into lunge, rotate elbow up towards ceiling, follow with gaze.',
            order: 3
          },
          {
            name: 'Cat-Cow Flow',
            muscleGroup: 'Spine',
            sets: 2,
            reps: '10 cycles',
            restSeconds: 30,
            formNotes: 'Inhale to arch back, exhale to round spine, move slowly with breath.',
            order: 4
          }
        ]
      },
      {
        title: 'Deep Squat & Spine Decompression',
        shortDescription: 'Build deep lower body mobility and release lower back stiffness.',
        fullDescription: 'This routine focus on deep squat positions, ankle dorsiflexion, hamstring flexibility, and spinal traction. Perfect to practice daily to counter the effects of chronic sitting.',
        coverImageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop',
        difficulty: 'intermediate',
        category: 'mobility',
        durationWeeks: 6,
        equipmentNeeded: ['Pull Up Bar'],
        createdBy: creatorId,
        rating: 4.6,
        createdAt: new Date(),
        exercises: [
          {
            name: 'Active Deep Squat Hold',
            muscleGroup: 'Ankles, Hips, Knees',
            sets: 3,
            reps: '1-2 minutes',
            restSeconds: 45,
            formNotes: 'Rest at the bottom of the squat, keep heels flat on the floor, chest up.',
            order: 1
          },
          {
            name: 'Hanging Passive Spine Decompression',
            muscleGroup: 'Spine, Shoulders',
            sets: 3,
            reps: '45-60 seconds',
            restSeconds: 60,
            formNotes: 'Hang from pull-up bar, let gravity pull hips down, relax lower back completely.',
            order: 2
          },
          {
            name: 'Cossack Squats',
            muscleGroup: 'Adductors, Hips',
            sets: 3,
            reps: '10 reps per side',
            restSeconds: 60,
            formNotes: 'Lower side to side, keeping heel of bent leg flat and straight leg toes pointed up.',
            order: 3
          },
          {
            name: 'Jeffersons Curls',
            muscleGroup: 'Hamstrings, Posterior Chain',
            sets: 3,
            reps: '8 reps',
            restSeconds: 60,
            formNotes: 'Round spine vertebra by vertebra, go as low as possible, do not use heavy weights.',
            order: 4
          }
        ]
      },
      {
        title: 'Active Flexibility for Gymnastics',
        shortDescription: 'Advanced mobility drills targeting active splits and extreme shoulder openings.',
        fullDescription: 'Gymnasts have a combination of extreme flexibility and the strength to control that flexibility. This course trains end-range strength in the shoulders, hips, and hamstrings to allow active leg raises and handstand variations.',
        coverImageUrl: 'https://images.unsplash.com/photo-1507398941214-572c25f4b1dc?q=80&w=800&auto=format&fit=crop',
        difficulty: 'advanced',
        category: 'mobility',
        durationWeeks: 10,
        equipmentNeeded: ['Resistance Bands', 'Parallettes'],
        createdBy: creatorId,
        rating: 4.9,
        createdAt: new Date(),
        exercises: [
          {
            name: 'Pike Stretch (Active)',
            muscleGroup: 'Hamstrings',
            sets: 3,
            reps: '30 seconds',
            restSeconds: 45,
            formNotes: 'Sit, keep back flat, engage quads, pull torso closer to legs using core strength.',
            order: 1
          },
          {
            name: 'Butcher\'s Block Stretch',
            muscleGroup: 'Shoulders, Lats',
            sets: 3,
            reps: '45 seconds',
            restSeconds: 60,
            formNotes: 'Elbows on bench, hold stick, drop head down to stretch shoulder flexion.',
            order: 2
          },
          {
            name: 'Straddle Compression Lifts',
            muscleGroup: 'Hip Flexors, Lower Abs',
            sets: 4,
            reps: '12 lifts',
            restSeconds: 60,
            formNotes: 'Place hands between thighs on floor, lift legs off ground while staying upright.',
            order: 3
          },
          {
            name: 'PNF Hamstring Contract-Relax',
            muscleGroup: 'Hamstrings',
            sets: 3,
            reps: '5 cycles of 5s pull, 10s relax',
            restSeconds: 90,
            formNotes: 'Use band to pull leg, push against band for 5s, then pull closer for 10s.',
            order: 4
          }
        ]
      },
      {
        title: 'Street Workout Freestyle Basics',
        shortDescription: 'Learn entry-level dynamic and momentum-based bar skills like muscle-ups.',
        fullDescription: 'Dynamic street workout is all about speed, explosiveness, and body control. In this guide, we cover the high pull-up, bar kipping mechanics, standard muscle-ups, and the 360-spin transition foundations.',
        coverImageUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800&auto=format&fit=crop',
        difficulty: 'intermediate',
        category: 'street-workout',
        durationWeeks: 8,
        equipmentNeeded: ['Pull Up Bar', 'Resistance Bands'],
        createdBy: creatorId,
        rating: 4.7,
        createdAt: new Date(),
        exercises: [
          {
            name: 'Kipping Swing Mechanics',
            muscleGroup: 'Shoulders, Core',
            sets: 4,
            reps: '10 swings',
            restSeconds: 60,
            formNotes: 'Generate swing from shoulders and core, not the knees.',
            order: 1
          },
          {
            name: 'Explosive Pull-ups',
            muscleGroup: 'Lats, Arms',
            sets: 4,
            reps: '5 reps',
            restSeconds: 90,
            formNotes: 'Pull as fast and hard as possible, targeting chest/abdomen to touch the bar.',
            order: 2
          },
          {
            name: 'Kipping Muscle-up',
            muscleGroup: 'Pull-up to Dip Transition',
            sets: 4,
            reps: '3-5 reps',
            restSeconds: 120,
            formNotes: 'Swing forward, pull back and down, lean over the bar, press up.',
            order: 3
          },
          {
            name: 'Straight Bar Dips',
            muscleGroup: 'Triceps, Chest',
            sets: 3,
            reps: '10 reps',
            restSeconds: 60,
            formNotes: 'Lean over the bar, lower chest to touch the bar, push back up.',
            order: 4
          }
        ]
      },
      {
        title: 'Bar Brother Conditioning',
        shortDescription: 'Circuit-based bar training to pack on muscle and shred body fat.',
        fullDescription: 'Classic street workout conditioning. You will perform high-intensity circuits containing pull-ups, chin-ups, dips, and push-ups with minimal rest to improve cardiovascular output and muscular stamina.',
        coverImageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop',
        difficulty: 'beginner',
        category: 'street-workout',
        durationWeeks: 6,
        equipmentNeeded: ['Pull Up Bar', 'Dip Bars'],
        createdBy: creatorId,
        rating: 4.6,
        createdAt: new Date(),
        exercises: [
          {
            name: 'Pull-ups',
            muscleGroup: 'Back',
            sets: 4,
            reps: '8 reps',
            restSeconds: 30,
            formNotes: 'Circuit exercise: move immediately to next exercise after completing.',
            order: 1
          },
          {
            name: 'Parallel Bar Dips',
            muscleGroup: 'Triceps, Chest',
            sets: 4,
            reps: '12 reps',
            restSeconds: 30,
            formNotes: 'Circuit exercise: maintain clean form even under fatigue.',
            order: 2
          },
          {
            name: 'Chin-ups',
            muscleGroup: 'Biceps, Lats',
            sets: 4,
            reps: '8 reps',
            restSeconds: 30,
            formNotes: 'Circuit exercise: underhand grip, pull elbows to side.',
            order: 3
          },
          {
            name: 'Push-ups',
            muscleGroup: 'Chest, Arms',
            sets: 4,
            reps: '15 reps',
            restSeconds: 90,
            formNotes: 'Final circuit exercise, then rest 90s before repeating the loop.',
            order: 4
          }
        ]
      },
      {
        title: 'Ultimate Bar Warrior',
        shortDescription: 'Advanced freestyle combinations, one-arm pull-ups, and 360-spin combos.',
        fullDescription: 'The pinnacle of street workout training. You will combine strength, dynamics, and gymnastics to execute one-arm pull-ups, back-claps, 360-spin bar transfers, and handstands on top of the pull-up bar.',
        coverImageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop',
        difficulty: 'advanced',
        category: 'street-workout',
        durationWeeks: 12,
        equipmentNeeded: ['Pull Up Bar', 'Dip Bars', 'Resistance Bands'],
        createdBy: creatorId,
        rating: 4.9,
        createdAt: new Date(),
        exercises: [
          {
            name: 'One-Arm Pull-up (Negative or Assisted)',
            muscleGroup: 'Lats, Biceps, Core',
            sets: 4,
            reps: '3 reps per arm',
            restSeconds: 120,
            formNotes: 'Hold the bar, lower down over 5s as slow as possible, engage scapula.',
            order: 1
          },
          {
            name: '360 Spin Bar Transfers',
            muscleGroup: 'Freestyle, Grip, Momentum',
            sets: 5,
            reps: '5 attempts',
            restSeconds: 90,
            formNotes: 'Pull high, push away, spin, catch the bar with active grip.',
            order: 2
          },
          {
            name: 'Weighted Parallel Dips (+30kg)',
            muscleGroup: 'Triceps, Chest',
            sets: 4,
            reps: '6 reps',
            restSeconds: 100,
            formNotes: 'Maintain perfect execution, control the descent.',
            order: 3
          },
          {
            name: 'Hanging Windipers (Windshield Wipers)',
            muscleGroup: 'Obliques, Core, Grip',
            sets: 4,
            reps: '12 reps total',
            restSeconds: 75,
            formNotes: 'Keep legs straight and rotate them side to side under bar control.',
            order: 4
          }
        ]
      }
    ];

    // Seed the database
    await programsCollection.insertMany(programsToSeed);
    console.log(`Successfully seeded ${programsToSeed.length} programs!`);

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await closeDB();
    console.log('Seeding process finished.');
  }
}

// Execute the seed function
seed();
