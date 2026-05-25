export type Gender = "male" | "female" | "other";
export type Equipment = "gym" | "home-gym" | "dumbbells" | "none";
export type Experience = "beginner" | "intermediate" | "advanced";
export type Goal = "lose-fat" | "build-muscle" | "endurance" | "general-health" | "strength";

export interface AnalysisInput {
  name?: string;
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  waistCm?: number;
  injuries: string[];
  diet: "omnivore" | "vegetarian" | "vegan" | "pescatarian";
  goal: Goal;
  experience: Experience;
  equipment: Equipment;
  sleepHours: number;
  activeDaysPerWeek: number;
  waterLiters: number;
}

export interface AnalysisResult {
  score: number;
  bmi: number;
  bmiCategory: string;
  bmr: number;
  tdee: number;
  proteinGrams: number;
  calorieTarget: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: { title: string; detail: string }[];
  pillars: { name: string; value: number }[];
}

const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n));

export function analyze(i: AnalysisInput): AnalysisResult {
  const heightM = i.heightCm / 100;
  const bmi = i.weightKg / (heightM * heightM);
  const bmiCategory =
    bmi < 18.5 ? "Underweight" : bmi < 25 ? "Healthy" : bmi < 30 ? "Overweight" : "Obese";

  // Mifflin-St Jeor BMR
  const bmr =
    i.gender === "male"
      ? 10 * i.weightKg + 6.25 * i.heightCm - 5 * i.age + 5
      : 10 * i.weightKg + 6.25 * i.heightCm - 5 * i.age - 161;

  const activityFactor = [1.2, 1.3, 1.4, 1.5, 1.6, 1.725, 1.85, 1.9][Math.min(7, i.activeDaysPerWeek)];
  const tdee = Math.round(bmr * activityFactor);

  const goalAdjust =
    i.goal === "lose-fat" ? -450 : i.goal === "build-muscle" ? 300 : i.goal === "strength" ? 200 : 0;
  const calorieTarget = Math.round(tdee + goalAdjust);

  const proteinPerKg =
    i.goal === "build-muscle" || i.goal === "strength" ? 2.0 : i.goal === "lose-fat" ? 2.2 : 1.6;
  const proteinGrams = Math.round(i.weightKg * proteinPerKg);

  // Pillars 0-100
  const bmiScore = clamp(100 - Math.abs(bmi - 22) * 8);
  const activityScore = clamp(i.activeDaysPerWeek * 14);
  const sleepScore = clamp(100 - Math.abs(i.sleepHours - 7.5) * 14);
  const hydrationScore = clamp((i.waterLiters / 3) * 100);
  const recoveryScore = clamp(sleepScore * 0.7 + (i.injuries.length === 0 ? 30 : Math.max(0, 30 - i.injuries.length * 10)));
  const experienceScore = i.experience === "beginner" ? 50 : i.experience === "intermediate" ? 75 : 92;

  const pillars = [
    { name: "Body Composition", value: Math.round(bmiScore) },
    { name: "Activity", value: Math.round(activityScore) },
    { name: "Sleep", value: Math.round(sleepScore) },
    { name: "Hydration", value: Math.round(hydrationScore) },
    { name: "Recovery", value: Math.round(recoveryScore) },
    { name: "Training Base", value: Math.round(experienceScore) },
  ];

  const score = Math.round(
    pillars.reduce((a, b) => a + b.value, 0) / pillars.length
  );

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  pillars.forEach((p) => {
    if (p.value >= 75) strengths.push(p.name);
    else if (p.value < 55) weaknesses.push(p.name);
  });

  const recommendations: { title: string; detail: string }[] = [];
  if (hydrationScore < 70)
    recommendations.push({
      title: "Increase daily water intake",
      detail: `Aim for ~${Math.round(i.weightKg * 0.033 * 10) / 10}L per day. Hydration improves performance, recovery and appetite regulation.`,
    });
  if (sleepScore < 70)
    recommendations.push({
      title: "Protect 7–9 hours of sleep",
      detail: "Sleep is when muscle repair and hormonal recovery happen. Consistent bedtime > total hours.",
    });
  if (activityScore < 70)
    recommendations.push({
      title: "Move 4–5 days per week",
      detail: "Mix 3 resistance sessions with 2 zone-2 cardio sessions (30–45 min) for cardiovascular base.",
    });
  if (bmi >= 25)
    recommendations.push({
      title: "Moderate calorie deficit",
      detail: `Target ~${calorieTarget} kcal/day with ${proteinGrams}g protein to preserve lean mass while losing fat.`,
    });
  if (bmi < 18.5 || i.goal === "build-muscle")
    recommendations.push({
      title: "Progressive overload + surplus",
      detail: `Eat ~${calorieTarget} kcal with ${proteinGrams}g protein. Add load or reps weekly on compound lifts.`,
    });
  if (i.injuries.length > 0)
    recommendations.push({
      title: "Train around injuries",
      detail: "Use unilateral and machine work to bypass painful ranges. Consider a 6-week mobility block.",
    });
  if (recommendations.length < 3)
    recommendations.push({
      title: "Track 3 keystone habits",
      detail: "Protein per meal, daily steps, lights-out time. Consistency beats intensity.",
    });

  return {
    score,
    bmi: Math.round(bmi * 10) / 10,
    bmiCategory,
    bmr: Math.round(bmr),
    tdee,
    proteinGrams,
    calorieTarget,
    strengths,
    weaknesses,
    recommendations,
    pillars,
  };
}

export function buildWorkoutPlan(i: AnalysisInput) {
  const eq = i.equipment;
  const goal = i.goal;
  const days =
    i.experience === "beginner" ? 3 : i.experience === "intermediate" ? 4 : 5;

  const libraries: Record<Equipment, Record<string, string[]>> = {
    gym: {
      push: ["Barbell Bench Press 4x6", "Overhead Press 3x8", "Incline DB Press 3x10", "Cable Fly 3x12", "Triceps Pushdown 3x12"],
      pull: ["Deadlift 4x5", "Pull-ups 4x AMRAP", "Barbell Row 3x8", "Face Pulls 3x15", "Biceps Curl 3x12"],
      legs: ["Back Squat 4x6", "Romanian Deadlift 3x8", "Leg Press 3x10", "Walking Lunge 3x12", "Calf Raise 4x15"],
      full: ["Trap Bar Deadlift 4x5", "Goblet Squat 3x10", "DB Bench Press 3x10", "One-arm Row 3x10", "Plank 3x60s"],
      upper: ["Bench Press 4x6", "Barbell Row 4x8", "Overhead Press 3x8", "Pull-ups 3x AMRAP", "Curl + Triceps 3x12"],
      lower: ["Back Squat 4x6", "Romanian Deadlift 3x8", "Hip Thrust 3x10", "Leg Curl 3x12", "Calf Raise 4x15"],
      cardio: ["Zone-2 incline walk 35 min", "Rower intervals 8x500m"],
      hiit: ["Bike sprints 10x30s/60s", "Sled push 6x20m", "Battle ropes 5x40s"],
      conditioning: ["Row 5x4min @ threshold", "KB swings 5x20", "Farmer carry 4x30m"],
      tempo: ["Treadmill tempo 25 min", "Incline walk 15 min cooldown"],
      long: ["Steady run / bike 60–75 min zone-2"],
      core: ["Hanging leg raise 3x12", "Cable woodchop 3x12/side", "Plank 3x60s", "Pallof press 3x12/side"],
      mobility: ["Hip flow 10 min", "Thoracic openers 10 min", "Couch stretch 2x60s/side"],
    },
    "home-gym": {
      push: ["DB Bench 4x8", "DB Shoulder Press 3x10", "Push-up Variations 3x AMRAP", "DB Skullcrusher 3x12"],
      pull: ["DB Row 4x10", "Band Pulldown 3x12", "DB Curl 3x12", "Reverse Fly 3x15"],
      legs: ["Goblet Squat 4x10", "DB RDL 3x10", "Bulgarian Split Squat 3x10", "Calf Raise 3x15"],
      full: ["DB Thruster 4x8", "Renegade Row 3x10", "Reverse Lunge 3x10", "Hollow Hold 3x30s"],
      upper: ["DB Bench 4x8", "DB Row 4x10", "DB Press 3x10", "Band Pulldown 3x12"],
      lower: ["Goblet Squat 4x10", "DB RDL 4x10", "Reverse Lunge 3x10", "Calf Raise 3x20"],
      cardio: ["Jump rope 6x90s", "Brisk walk 30 min"],
      hiit: ["DB Thruster 8x30s/30s", "Burpees 6x40s", "Jump squat 5x20"],
      conditioning: ["Kettlebell EMOM 20 min", "Stair sprints 8x"],
      tempo: ["Outdoor jog tempo 25 min"],
      long: ["Long walk / cycle 60 min zone-2"],
      core: ["Plank circuit 3 rounds", "Russian twist 3x20", "Dead bug 3x12"],
      mobility: ["Yoga flow 20 min", "Couch stretch 2x60s/side"],
    },
    dumbbells: {
      push: ["Floor Press 4x10", "Standing Press 3x10", "Push-ups 3x AMRAP", "Lateral Raise 3x15"],
      pull: ["One-arm Row 4x10", "DB Pullover 3x12", "DB Curl 3x12", "Y-Raise 3x15"],
      legs: ["Goblet Squat 4x10", "DB RDL 4x10", "Reverse Lunge 3x10", "Calf Raise 3x20"],
      full: ["DB Clean & Press 4x6", "Renegade Row 3x10", "Goblet Squat 3x12", "Plank 3x45s"],
      upper: ["Floor Press 4x10", "One-arm Row 4x10", "DB Press 3x10", "DB Curl 3x12"],
      lower: ["Goblet Squat 4x12", "DB RDL 4x10", "Split Squat 3x10", "Calf Raise 3x20"],
      cardio: ["DB Carry 5x40m", "Stair intervals 10 min"],
      hiit: ["DB complex 6 rounds (8 rep each)", "Burpees 5x40s"],
      conditioning: ["DB carry medley 20 min", "Goblet squat EMOM 15 min"],
      tempo: ["Brisk jog tempo 20 min"],
      long: ["Steady walk / hike 60 min"],
      core: ["Plank 3x60s", "DB Russian twist 3x20", "Suitcase carry 3x30m"],
      mobility: ["Hip flow 15 min", "Shoulder dislocates 3x15"],
    },
    none: {
      push: ["Push-ups 5x AMRAP", "Pike Push-ups 3x10", "Decline Push-ups 3x10", "Diamond Push-ups 3x10"],
      pull: ["Door-frame Rows 4x10", "Towel Curls 3x15", "Superman Hold 3x30s"],
      legs: ["Bodyweight Squat 4x20", "Reverse Lunge 3x12", "Single-leg Glute Bridge 3x12", "Calf Raise 3x25"],
      full: ["Burpees 4x10", "Mountain Climbers 4x40s", "Plank 3x60s", "Squat-to-Press 3x15"],
      upper: ["Push-ups 5x AMRAP", "Door-frame Rows 4x10", "Pike Push-ups 3x10", "Plank 3x45s"],
      lower: ["Bodyweight Squat 5x20", "Reverse Lunge 3x12", "Glute Bridge 3x15", "Calf Raise 3x25"],
      cardio: ["Brisk walk 40 min", "HIIT 20s/40s x 12"],
      hiit: ["Burpees 6x40s", "Jump squats 6x20", "Mountain climbers 5x45s"],
      conditioning: ["Run intervals 8x400m", "Bodyweight EMOM 20 min"],
      tempo: ["Jog tempo 25 min"],
      long: ["Walk / run zone-2 60 min"],
      core: ["Plank 3x60s", "Hollow hold 3x30s", "Bicycle crunch 3x20"],
      mobility: ["Sun salutations 15 min", "Hip openers 10 min"],
    },
  };

  const lib = libraries[eq];

  // Goal-driven weekly templates. 7 entries for 7 days.
  const templates: Record<Goal, { 3: string[]; 4: string[]; 5: string[] }> = {
    "lose-fat": {
      3: ["full", "rest", "hiit", "rest", "cardio", "rest", "long"],
      4: ["full", "hiit", "rest", "full", "cardio", "rest", "long"],
      5: ["upper", "hiit", "lower", "cardio", "full", "rest", "long"],
    },
    "build-muscle": {
      3: ["push", "pull", "rest", "legs", "rest", "full", "rest"],
      4: ["push", "pull", "legs", "rest", "upper", "rest", "cardio"],
      5: ["push", "pull", "legs", "push", "pull", "rest", "cardio"],
    },
    strength: {
      3: ["full", "rest", "full", "rest", "full", "rest", "mobility"],
      4: ["upper", "lower", "rest", "upper", "lower", "rest", "mobility"],
      5: ["push", "pull", "legs", "upper", "lower", "rest", "mobility"],
    },
    endurance: {
      3: ["tempo", "rest", "full", "rest", "long", "rest", "cardio"],
      4: ["tempo", "full", "rest", "hiit", "long", "rest", "cardio"],
      5: ["tempo", "full", "hiit", "cardio", "long", "rest", "mobility"],
    },
    "general-health": {
      3: ["full", "rest", "cardio", "rest", "full", "rest", "mobility"],
      4: ["full", "cardio", "rest", "full", "core", "rest", "long"],
      5: ["upper", "cardio", "lower", "core", "full", "rest", "long"],
    },
  };

  const split = templates[goal][days as 3 | 4 | 5];

  const focusLabel: Record<string, string> = {
    push: "Push", pull: "Pull", legs: "Legs", full: "Full body",
    upper: "Upper body", lower: "Lower body",
    cardio: "Zone-2 cardio", hiit: "HIIT", conditioning: "Conditioning",
    tempo: "Tempo run", long: "Long endurance", core: "Core + stability",
    mobility: "Mobility + recovery", rest: "Active recovery",
  };

  return split.map((day, idx) => ({
    day: `Day ${idx + 1}`,
    focus: focusLabel[day] ?? day,
    exercises: day === "rest"
      ? ["Mobility flow 15 min", "Easy walk 20 min"]
      : lib[day] ?? lib.full,
  }));
}

export function buildMealPlan(i: AnalysisInput, r: AnalysisResult) {
  const isVeg = i.diet !== "omnivore" && i.diet !== "pescatarian";
  const proteinSource = isVeg ? "tofu/tempeh + lentils" : i.diet === "pescatarian" ? "salmon or cod" : "chicken or lean beef";
  return [
    { meal: "Breakfast", kcal: Math.round(r.calorieTarget * 0.25), items: ["Oats + berries + Greek yogurt", "Black coffee or green tea"] },
    { meal: "Lunch", kcal: Math.round(r.calorieTarget * 0.32), items: [`${proteinSource} bowl with rice & greens`, "Olive oil + lemon"] },
    { meal: "Snack", kcal: Math.round(r.calorieTarget * 0.13), items: ["Whey or soy protein shake", "Banana + almonds"] },
    { meal: "Dinner", kcal: Math.round(r.calorieTarget * 0.3), items: [`${proteinSource} + sweet potato + roasted veg`, "Mixed salad"] },
  ];
}

// -------------------- Risk detection --------------------
export interface RiskItem { label: string; severity: "low" | "moderate" | "high"; detail: string; }

export function detectRisks(i: AnalysisInput, r: AnalysisResult): RiskItem[] {
  const risks: RiskItem[] = [];
  if (i.activeDaysPerWeek <= 1) risks.push({ label: "Sedentary lifestyle risk", severity: "high", detail: "Fewer than 2 active days/week is linked to higher all-cause mortality (WHO 2020). Target 150+ min/week of moderate activity." });
  else if (i.activeDaysPerWeek <= 2) risks.push({ label: "Low activity volume", severity: "moderate", detail: "Below WHO minimum of 150 min/week. Add 1–2 zone-2 cardio sessions of 30–40 min." });

  if (i.waterLiters < 1.5) risks.push({ label: "Poor nutrition / hydration", severity: "high", detail: "Chronic under-hydration impairs cognition, recovery and appetite signals. Hit at least 33ml/kg of body weight daily." });

  const proteinPerKg = r.proteinGrams / i.weightKg;
  if (proteinPerKg < 1.2) risks.push({ label: "Low protein intake risk", severity: "moderate", detail: `Targets below 1.2 g/kg accelerate sarcopenia. Your target is ${r.proteinGrams}g — split across 3–4 meals of 30–40g.` });
  else if (i.diet === "vegan" || i.diet === "vegetarian") risks.push({ label: "Protein quality watch", severity: "low", detail: "Plant proteins are lower in leucine. Combine sources (legume + grain) and consider 25% higher total intake." });

  if (i.sleepHours < 6) risks.push({ label: "Sleep deficiency", severity: "high", detail: "Under 6 h/night doubles injury risk in athletes (Milewski 2014) and impairs glucose handling. Prioritise 7–9 h." });
  else if (i.sleepHours < 7) risks.push({ label: "Marginal sleep", severity: "moderate", detail: "6–7 h is below the adult optimum. Anchor a consistent bedtime within 30 min nightly." });

  if (r.bmi < 18.5) risks.push({ label: "Underweight indicator", severity: "moderate", detail: `BMI ${r.bmi} suggests under-fuelling. Aim for a 250–400 kcal surplus with ${r.proteinGrams}g protein.` });
  else if (r.bmi >= 30) risks.push({ label: "Obesity indicator", severity: "high", detail: `BMI ${r.bmi} carries elevated cardiometabolic risk. A 0.5–1% body-weight loss per week is safe and sustainable.` });
  else if (r.bmi >= 25) risks.push({ label: "Overweight indicator", severity: "moderate", detail: `BMI ${r.bmi}. Even a 5–10% reduction improves insulin sensitivity and blood pressure.` });

  if (risks.length === 0) risks.push({ label: "No major risks detected", severity: "low", detail: "Your inputs fall within healthy ranges. Keep stacking the basics — sleep, steps, protein, hydration." });
  return risks;
}

// -------------------- Smart workout recommendations --------------------
export function smartWorkoutRecs(i: AnalysisInput): string[] {
  const recs: string[] = [];
  if (i.injuries.length > 0) recs.push("Focus more on mobility training — start each session with 8–10 min of joint prep.");
  if (i.activeDaysPerWeek >= 6 && i.goal !== "endurance") recs.push("Reduce excessive cardio — cap zone-2 at 2–3 sessions to protect strength gains.");
  if (i.experience !== "beginner" && (i.goal === "build-muscle" || i.goal === "strength")) recs.push("Anchor each week on compound exercises — squat, hinge, press, pull.");
  if (i.goal === "lose-fat") recs.push("Keep resistance volume high while cutting — it preserves lean mass during a deficit.");
  if (i.goal === "endurance") recs.push("Use an 80/20 split — 80% easy zone-2, 20% hard intervals (Seiler).");
  if (i.experience === "beginner") recs.push("Prioritise technique over load for 6–8 weeks — neural adaptations come first.");
  if (i.sleepHours < 7) recs.push("Cap session RPE at 8 on low-sleep days — recovery is the limiter, not effort.");
  if (i.equipment === "none") recs.push("Add tempo and pauses to bodyweight work to keep progressing without load.");
  return recs.slice(0, 6);
}

// -------------------- Exercise library --------------------
export interface LibraryExercise { name: string; muscles: string; cue: string; }
export const exerciseLibrary: { category: string; items: LibraryExercise[] }[] = [
  { category: "Compound — Lower", items: [
    { name: "Back Squat", muscles: "Quads, glutes, core", cue: "Brace, descend to parallel, drive through mid-foot." },
    { name: "Romanian Deadlift", muscles: "Hamstrings, glutes", cue: "Hinge at hips, soft knees, bar travels close to legs." },
    { name: "Bulgarian Split Squat", muscles: "Quads, glutes, stabilisers", cue: "Front foot flat, knee tracks over toe." },
  ]},
  { category: "Compound — Upper Push", items: [
    { name: "Bench Press", muscles: "Chest, triceps, front delts", cue: "Scapulae retracted, bar to lower chest, full lockout." },
    { name: "Overhead Press", muscles: "Shoulders, triceps, core", cue: "Ribs down, glutes tight, press head 'through' at top." },
    { name: "Dip", muscles: "Chest, triceps", cue: "Lean forward 15°, lower until shoulders ≈ elbows." },
  ]},
  { category: "Compound — Upper Pull", items: [
    { name: "Pull-up", muscles: "Lats, biceps, mid-back", cue: "Initiate with scapular depression, chest to bar." },
    { name: "Barbell Row", muscles: "Lats, rhomboids, traps", cue: "Hinge to 45°, pull to lower ribs, no torso swing." },
    { name: "Face Pull", muscles: "Rear delts, rotator cuff", cue: "Elbows high, externally rotate at end range." },
  ]},
  { category: "Mobility & Core", items: [
    { name: "World's Greatest Stretch", muscles: "Hips, T-spine", cue: "Lunge, rotate top arm to ceiling, alternate sides." },
    { name: "Dead Bug", muscles: "Anti-extension core", cue: "Low back glued to floor, slow opposite arm/leg." },
    { name: "90/90 Hip Switch", muscles: "Hip rotators", cue: "Tall spine, switch knees side-to-side hands-free." },
  ]},
  { category: "Conditioning", items: [
    { name: "Zone-2 Incline Walk", muscles: "Aerobic base", cue: "Nasal breathing, HR ≈ 60–70% max for 30–45 min." },
    { name: "Rower Intervals", muscles: "Full body power", cue: "Legs first, 8x500m @ 2k pace, 90s rest." },
    { name: "Jump Rope", muscles: "Calves, coordination", cue: "Soft knees, wrists drive the rope, 6x90s on / 60s off." },
  ]},
];

// -------------------- Preferred foods --------------------
export interface FoodGroup { meal: string; veg: string[]; nonVeg: string[]; }
export const preferredFoods: FoodGroup[] = [
  { meal: "Breakfast",
    veg: ["Oats + milk + chia + berries", "Greek yogurt + granola + honey", "Paneer / tofu scramble with whole-wheat toast", "Besan chilla with mint chutney", "Peanut butter banana smoothie"],
    nonVeg: ["3-egg omelette + spinach + toast", "Smoked salmon on rye + avocado", "Chicken & egg-white wrap", "Greek yogurt + boiled eggs + fruit", "Tuna avocado bagel"] },
  { meal: "Lunch",
    veg: ["Rajma / chickpea curry + brown rice + salad", "Quinoa bowl + roasted veg + hummus + feta", "Lentil dal + roti + curd", "Tofu stir-fry + soba noodles", "Paneer tikka wrap + greens"],
    nonVeg: ["Grilled chicken + sweet potato + broccoli", "Salmon poke bowl + edamame", "Lean beef stir-fry + jasmine rice", "Turkey & avocado salad bowl", "Chicken biryani (portion-controlled) + raita"] },
  { meal: "Dinner",
    veg: ["Tofu tikka masala + cauliflower rice", "Chickpea pasta + tomato basil + parmesan", "Mushroom & lentil shepherd's pie", "Vegetable khichdi + ghee", "Stuffed bell peppers + quinoa"],
    nonVeg: ["Grilled fish + roasted veg + lemon", "Chicken curry + roti + cucumber salad", "Prawn stir-fry + brown rice", "Baked cod + asparagus + potatoes", "Tandoori chicken + dal + salad"] },
  { meal: "High-protein staples",
    veg: ["Paneer — 18g / 100g", "Tofu / tempeh — 15–20g / 100g", "Greek yogurt — 10g / 100g", "Lentils & chickpeas — 9g / 100g cooked", "Soya chunks — 52g / 100g dry", "Whey or plant protein shake"],
    nonVeg: ["Chicken breast — 31g / 100g", "Eggs — 6g per egg", "Salmon — 25g / 100g", "Lean beef — 26g / 100g", "Tuna — 28g / 100g", "Whey isolate shake"] },
];

// -------------------- Detailed goal-based roadmap --------------------
export interface RoadmapPhase { range: string; title: string; focus: string; targets: string[]; nutrition: string; training: string; }
export interface GoalRoadmap { goalLabel: string; summary: string; weeklyTarget: string; monthlyTarget: string; phases: RoadmapPhase[]; evidence: string[]; }

export function buildRoadmap(i: AnalysisInput, r: AnalysisResult): GoalRoadmap {
  const w = i.weightKg;
  const proteinG = r.proteinGrams;
  const kcal = r.calorieTarget;

  if (i.goal === "lose-fat") {
    const weeklyLoss = +(w * 0.0075).toFixed(2);
    const monthlyLoss = +(weeklyLoss * 4).toFixed(1);
    return {
      goalLabel: "Fat loss",
      summary: "A sustainable cut at 0.5–1% body-weight per week preserves muscle and metabolic rate (Helms 2014). Recalibrate calories every 3–4 weeks as weight drops.",
      weeklyTarget: `≈ ${weeklyLoss} kg / week`,
      monthlyTarget: `≈ ${monthlyLoss} kg / month (3.0–4.5 kg over 4 weeks is realistic)`,
      phases: [
        { range: "Weeks 1–2", title: "Prime the deficit", focus: "Establish protein, steps and sleep before chasing scale weight.",
          targets: ["Hit 8–10k steps/day", `${proteinG}g protein daily, 4 meals`, "Sleep 7.5h+ — lights out same time"],
          nutrition: `${kcal} kcal — 40% carbs / 30% protein / 30% fat. Build meals around lean protein + fibrous veg.`,
          training: "3 full-body resistance sessions + 2 zone-2 walks (30 min)." },
        { range: "Weeks 3–6", title: "Drive the deficit", focus: "Add structured cardio while protecting strength.",
          targets: [`Lose ${(weeklyLoss * 4).toFixed(1)} kg by week 6`, "Maintain top-set strength on big lifts", "Waist ↓ 2–3 cm"],
          nutrition: `${kcal} kcal. Re-feed at maintenance one day/week to support training output.`,
          training: "4 resistance sessions (upper/lower split) + 2–3 zone-2 cardio + 1 interval session." },
        { range: "Weeks 7–10", title: "Break the plateau", focus: "Drop kcal by ~5% if weekly loss stalls for 2+ weeks.",
          targets: ["Body-fat ↓ 2–3%", "Reps in reserve still ≥ 1 on working sets", "Energy stable, mood good"],
          nutrition: `${Math.round(kcal * 0.95)} kcal floor. Keep protein at ${proteinG}g (do NOT cut protein).`,
          training: "Add 10–15% step volume. Swap 1 cardio session for hill intervals." },
        { range: "Weeks 11–12", title: "Diet break + retest", focus: "Eat at maintenance for 7–10 days, then reassess.",
          targets: ["Total loss ≈ 4–6 kg", "Retake measurements + photos", "Choose: continue cut or transition to maintenance"],
          nutrition: `Maintenance (~${r.tdee} kcal) for 1 week to restore leptin & training capacity.`,
          training: "Deload week (50% volume) then test 5RM on squat / bench / deadlift." },
      ],
      evidence: ["Helms et al. 2014 — 0.5–1% BW/week loss best for lean-mass retention", "Aragon & Schoenfeld 2013 — protein 1.6–2.2 g/kg supports recomposition", "WHO 2020 — 150–300 min moderate activity/week"],
    };
  }

  if (i.goal === "build-muscle") {
    const weeklyGain = +(w * 0.003).toFixed(2);
    const monthlyGain = +(weeklyGain * 4).toFixed(1);
    return {
      goalLabel: "Muscle gain (lean bulk)",
      summary: "Lean hypertrophy needs a modest surplus (+200–400 kcal), 1.6–2.2 g/kg protein, and 10–20 hard sets per muscle weekly (Schoenfeld 2017).",
      weeklyTarget: `+${weeklyGain} kg / week`,
      monthlyTarget: `+${monthlyGain} kg / month (most should be lean mass)`,
      phases: [
        { range: "Weeks 1–3", title: "Volume accumulation", focus: "Establish technique + push weekly set count.",
          targets: ["10 hard sets/muscle/week", "Bodyweight ↑ 0.5–1 kg", "Sleep 8h+ on training days"],
          nutrition: `${kcal} kcal (~+300 over TDEE), ${proteinG}g protein, carbs around training.`,
          training: "Upper/Lower 4x week. RIR 2–3. Track every working set." },
        { range: "Weeks 4–7", title: "Progressive overload", focus: "Add reps each week, then add 2.5–5 kg.",
          targets: ["Add a rep per set every 7–10 days", `+${(weeklyGain * 4).toFixed(1)} kg bodyweight`, "Waist gain ≤ 1 cm"],
          nutrition: `${kcal} kcal. If waist climbs fast, drop 150 kcal; if scale stalls, add 150.`,
          training: "Push/Pull/Legs 5x week. 14–18 sets/muscle. RIR 1–2 on top sets." },
        { range: "Weeks 8–10", title: "Intensification", focus: "Peak the working weights on key lifts.",
          targets: ["+5–10% on squat / bench / row", "Sleeves & quads measurably tighter", "Heart-rate recovery stable"],
          nutrition: `${Math.round(kcal * 1.05)} kcal on training days. Creatine 5g daily.`,
          training: "Reduce accessories ~20%, increase load 5–10% on compounds. Add 1 power set." },
        { range: "Weeks 11–12", title: "Deload + retest", focus: "Cut volume 40–50%, retest 5RMs.",
          targets: ["Visible recomposition", "Photos + tape every 4 weeks", "Decide: keep bulking or mini-cut"],
          nutrition: `${r.tdee} kcal maintenance, protein steady.`,
          training: "Deload week then test PRs. Re-set RIR targets for next block." },
      ],
      evidence: ["Schoenfeld 2017 — 10+ weekly sets/muscle drives hypertrophy dose-response", "Iraki 2019 — lean bulk surplus 200–400 kcal optimal for natural lifters", "Morton 2018 — 1.6 g/kg protein ceiling for added muscle in trained lifters"],
    };
  }

  if (i.goal === "strength") {
    return {
      goalLabel: "Maximal strength",
      summary: "Strength is a skill. Lower reps (1–5), higher intensity (75–90% 1RM), longer rest (3–5 min), and submaximal frequency 2–3x/week per lift (Rhea 2003).",
      weeklyTarget: "+2.5 kg on a main lift every 1–2 weeks",
      monthlyTarget: "+5–10 kg cumulative across squat / bench / deadlift",
      phases: [
        { range: "Weeks 1–3", title: "Movement quality", focus: "Groove technique at 70–75% with controlled tempo.",
          targets: ["Bar-path consistent on video", "RPE ≤ 7 on top sets", "Bodyweight stable"],
          nutrition: `${kcal} kcal at maintenance + ${proteinG}g protein.`,
          training: "Squat / Bench / Deadlift / Press 3x week, 5x5 @ 70–75%." },
        { range: "Weeks 4–7", title: "Intensity ramp", focus: "Climb to 80–87% on top sets, RPE 8.",
          targets: ["Hit 3–4 RM on each main lift", "Maintain bar speed", "Sleep 8h on heavy days"],
          nutrition: "Small +150 kcal surplus on lifting days.",
          training: "Wave loading: 5/3/1 or RTS. Two heavy + one technique day." },
        { range: "Weeks 8–10", title: "Peaking", focus: "Drop volume, hold intensity at 87–92%.",
          targets: ["Singles at 90% feel crisp", "Rest 4–5 min between top sets", "No max attempts until week 11"],
          nutrition: "Carbs +50g pre-session. Creatine 5g daily.",
          training: "Two heavy days, drop accessories 30%, taper 7–10 days before test." },
        { range: "Weeks 11–12", title: "Test + reset", focus: "Hit new 1RMs, then deload and start next block.",
          targets: ["+5–10 kg PRs on 2 of 3 lifts", "Full deload after test week", "Plan next mesocycle"],
          nutrition: "Maintenance, full carbs 24h before test.",
          training: "Test week: heavy single, then 2 back-off sets. Deload after." },
      ],
      evidence: ["Rhea 2003 meta — 80–85% 1RM optimal for trained strength gains", "Helms 2018 — RPE-based loading equal or better to %1RM"],
    };
  }

  if (i.goal === "endurance") {
    return {
      goalLabel: "Endurance & conditioning",
      summary: "An 80/20 polarised model (Seiler) builds aerobic base efficiently — most volume easy, 20% hard.",
      weeklyTarget: "+5–10% weekly volume (time, not pace)",
      monthlyTarget: "Increase long session by 10–15 min / month",
      phases: [
        { range: "Weeks 1–3", title: "Aerobic base", focus: "Build easy volume at conversational pace.",
          targets: ["4 zone-2 sessions/week", "Nasal-only on easy runs", "RHR ↓ 2–3 bpm"],
          nutrition: `${kcal} kcal, carbs 4–6 g/kg, hydrate 33ml/kg + 500ml/training hour.`,
          training: "Zone-2 30–60 min x4 + 1 strength day (squat/hinge/press)." },
        { range: "Weeks 4–7", title: "Threshold work", focus: "Add tempo + cruise intervals at 75–85% HRmax.",
          targets: ["Push lactate threshold up", "Long session ≥ 75 min", "VO2 proxy improves on retest"],
          nutrition: "Pre-session 30g carbs, post-session 0.4g/kg protein within 60 min.",
          training: "3 zone-2 + 1 tempo (3x10 min) + 1 long + strength." },
        { range: "Weeks 8–10", title: "VO2 max", focus: "Short, hard intervals.",
          targets: ["4x4 min @ 90–95% HRmax", "Mile / 5k pace ↓ 3–5%", "Sleep guarded"],
          nutrition: "Carbs 6–8 g/kg on hard days.",
          training: "1 VO2 session + 1 tempo + 3 easy + long run." },
        { range: "Weeks 11–12", title: "Sharpen + test", focus: "Cut volume 30%, hold intensity, then test.",
          targets: ["New 5k or FTP PR", "Recovery HRV stable", "Full deload after test"],
          nutrition: "Maintenance, carb-load 24–36h pre-test.",
          training: "Taper week + test event + active recovery week." },
      ],
      evidence: ["Seiler 2010 — 80/20 polarised training beats threshold-heavy models", "Bompa periodisation — base → build → peak → taper"],
    };
  }

  const underweight = r.bmi < 18.5;
  if (underweight) {
    return {
      goalLabel: "Healthy weight gain",
      summary: "Slow surplus (+300–500 kcal), strength training and protein every 3–4 hours builds lean mass without excessive fat.",
      weeklyTarget: "+0.3–0.5 kg / week",
      monthlyTarget: "+1.5–2 kg / month",
      phases: [
        { range: "Weeks 1–3", title: "Appetite ramp", focus: "Increase meal frequency to 4–5 / day.",
          targets: ["Add liquid calories (smoothies)", "+0.5 kg by week 3", "Sleep 8h+"],
          nutrition: `${kcal} kcal, ${proteinG}g protein, calorie-dense foods (nuts, oils, oats, full-fat dairy).`,
          training: "Full-body 3x week. Compound lifts only." },
        { range: "Weeks 4–8", title: "Strength + surplus", focus: "Lock in progressive overload.",
          targets: ["+1.5–2 kg", "+10% on main lifts", "Energy stable"],
          nutrition: `${Math.round(kcal * 1.05)} kcal if scale stalls 7 days.`,
          training: "Upper/Lower 4x week. RIR 1–2 on top sets." },
        { range: "Weeks 9–12", title: "Recomp checkpoint", focus: "Reassess and either continue or shift to maintenance.",
          targets: ["+3–5 kg total", "Strength PRs", "BMI back in healthy range"],
          nutrition: "Hold +250 kcal surplus. Creatine 5g daily.",
          training: "Push/Pull/Legs 5x week if recovering well." },
      ],
      evidence: ["Slater 2019 — 0.25–0.5%/week BW gain best for lean accrual", "ISSN 2017 — protein 1.6–2.2 g/kg supports lean mass during surplus"],
    };
  }

  return {
    goalLabel: "General health & longevity",
    summary: "WHO 2020 baseline: 150–300 min moderate or 75–150 min vigorous activity + 2 resistance sessions per week. Layer on sleep, hydration and a protein floor.",
    weeklyTarget: "150+ active minutes",
    monthlyTarget: "Build a 4-week training streak",
    phases: [
      { range: "Weeks 1–2", title: "Habit lock-in", focus: "Tiny, daily wins beat perfect weeks.",
        targets: ["Walk 8k steps/day", `${proteinG}g protein`, "Lights-out same time nightly"],
        nutrition: `${kcal} kcal maintenance, 80% whole foods.`,
        training: "3 full-body sessions + 2 brisk walks." },
      { range: "Weeks 3–6", title: "Aerobic base", focus: "Add structured zone-2.",
        targets: ["Resting HR ↓ 3–5 bpm", "Push-up & squat reps ↑ 20%", "Hydration 33 ml/kg"],
        nutrition: "Add 30g fibre/day and 2 fruit servings.",
        training: "3 resistance + 2 zone-2 (30 min) + mobility 10 min daily." },
      { range: "Weeks 7–10", title: "Strength layer", focus: "Add load to compounds for bone & metabolic health.",
        targets: ["+10% on squat / hinge / press", "VO2 proxy improves", "Sleep ≥ 7.5h"],
        nutrition: "Cycle carbs to training days.",
        training: "4 resistance days + 2 cardio + 1 long walk." },
      { range: "Weeks 11–12", title: "Retest + recalibrate", focus: "Measure, then choose next 12-week goal.",
        targets: ["Re-run analysis", "Score ↑ 10+ points", "Set next specific goal"],
        nutrition: "Maintain. Track weekly averages, not single days.",
        training: "Deload week then re-test baseline." },
    ],
    evidence: ["WHO 2020 physical-activity guidelines", "Lee 2017 — resistance training 2x/week reduces all-cause mortality 23%"],
  };
}
