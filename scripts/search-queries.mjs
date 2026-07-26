// PubMed search queries for Manifestation Research
// Derived from manifestation_interdisciplinary_journals_search_templates
// Each query targets a different facet of manifestation-related research.

export const SEARCH_QUERIES = [
  // 1. Direct manifestation discourse
  {
    name: 'Direct Manifestation',
    query:
      '(' +
      'manifestation[Title/Abstract] OR manifesting[Title/Abstract] OR ' +
      '"law of attraction"[Title/Abstract] OR "power of intention"[Title/Abstract] OR ' +
      '"vision board"[Title/Abstract] OR "New Thought"[Title/Abstract] OR ' +
      '"prosperity consciousness"[Title/Abstract] OR "prosperity spirituality"[Title/Abstract]' +
      ') AND (' +
      'psychology[Title/Abstract] OR psychiatry[Title/Abstract] OR health[Title/Abstract] OR ' +
      'wellbeing[Title/Abstract] OR "well-being"[Title/Abstract] OR ' +
      'behavior[Title/Abstract] OR behaviour[Title/Abstract] OR belief[Title/Abstract]' +
      ') NOT ("clinical manifestation"[Title] OR "clinical manifestations"[Title] OR symptoms[Title])',
  },

  // 2. Expectancy, placebo, and meaning response
  {
    name: 'Expectancy & Placebo',
    query:
      '(' +
      '"response expectancy"[Title/Abstract] OR "outcome expectancy"[Title/Abstract] OR ' +
      '"treatment expectancy"[Title/Abstract] OR "expectancy effect"[Title/Abstract] OR ' +
      '"placebo effect"[Title/Abstract] OR "placebo response"[Title/Abstract] OR ' +
      '"nocebo effect"[Title/Abstract] OR "meaning response"[Title/Abstract] OR ' +
      '"open-label placebo"[Title/Abstract]' +
      ') AND (' +
      'belief[Title/Abstract] OR expectation[Title/Abstract] OR meaning[Title/Abstract] OR ' +
      'symptom[Title/Abstract] OR outcome[Title/Abstract] OR health[Title/Abstract]' +
      ')',
  },

  // 3. Mental imagery, visualization & goal pursuit
  {
    name: 'Imagery & Goal Pursuit',
    query:
      '(' +
      '"mental imagery"[Title/Abstract] OR visualization[Title/Abstract] OR visualisation[Title/Abstract] OR ' +
      '"guided imagery"[Title/Abstract] OR "imagery rehearsal"[Title/Abstract] OR ' +
      '"mental rehearsal"[Title/Abstract] OR "process simulation"[Title/Abstract] OR ' +
      '"outcome simulation"[Title/Abstract] OR "mental practice"[Title/Abstract]' +
      ') AND (' +
      '"goal attainment"[Title/Abstract] OR performance[Title/Abstract] OR ' +
      'motivation[Title/Abstract] OR "behavior change"[Title/Abstract] OR ' +
      '"behaviour change"[Title/Abstract] OR "self-efficacy"[Title/Abstract]' +
      ')',
  },

  // 4. Positive fantasies vs. mental contrasting (Oettingen framework)
  {
    name: 'Positive Fantasies & Mental Contrasting',
    query:
      '(' +
      '"positive fantasies"[Title/Abstract] OR "mental contrasting"[Title/Abstract] OR ' +
      '"implementation intentions"[Title/Abstract] OR "fantasy realization theory"[Title/Abstract] OR ' +
      'WOOP[Title/Abstract] OR "episodic future thinking"[Title/Abstract] OR "possible selves"[Title/Abstract]' +
      ') AND (' +
      'goal[Title/Abstract] OR motivation[Title/Abstract] OR performance[Title/Abstract] OR ' +
      'behavior[Title/Abstract] OR behaviour[Title/Abstract]' +
      ')',
  },

  // 5. Magical thinking and clinical risk
  {
    name: 'Magical Thinking & Psychopathology',
    query:
      '(' +
      '"magical thinking"[Title/Abstract] OR "magical ideation"[Title/Abstract] OR ' +
      '"thought-action fusion"[Title/Abstract] OR apophenia[Title/Abstract] OR ' +
      '"illusion of control"[Title/Abstract]' +
      ') AND (' +
      'psychosis[Title/Abstract] OR mania[Title/Abstract] OR "bipolar disorder"[Title/Abstract] OR ' +
      'schizotyp[Title/Abstract] OR obsessive-compulsive[Title/Abstract] OR delusion[Title/Abstract]' +
      ')',
  },

  // 6. Predictive processing and belief
  {
    name: 'Predictive Processing & Belief',
    query:
      '(' +
      '"predictive processing"[Title/Abstract] OR "predictive coding"[Title/Abstract] OR ' +
      '"active inference"[Title/Abstract] OR "Bayesian brain"[Title/Abstract]' +
      ') AND (' +
      'belief[Title/Abstract] OR expectation[Title/Abstract] OR delusion[Title/Abstract] OR ' +
      'placebo[Title/Abstract] OR imagery[Title/Abstract]' +
      ')',
  },

  // 7. Optimism, hope, self-efficacy, and well-being
  {
    name: 'Optimism & Self-Efficacy',
    query:
      '(' +
      'optimism[Title/Abstract] OR "dispositional optimism"[Title/Abstract] OR ' +
      '"hope theory"[Title/Abstract] OR "self-efficacy"[Title/Abstract] OR ' +
      '"perceived control"[Title/Abstract] OR "locus of control"[Title/Abstract] OR ' +
      '"growth mindset"[Title/Abstract]' +
      ') AND (' +
      '"well-being"[Title/Abstract] OR wellbeing[Title/Abstract] OR "life satisfaction"[Title/Abstract] OR ' +
      '"mental health"[Title/Abstract] OR "goal pursuit"[Title/Abstract]' +
      ')',
  },

  // 8. Spirituality, religion, and mental health
  {
    name: 'Spirituality & Mental Health',
    query:
      '(' +
      'spiritual[Title/Abstract] OR "New Age"[Title/Abstract] OR ' +
      '"prosperity gospel"[Title/Abstract] OR "divine control"[Title/Abstract] OR ' +
      'prayer[Title/Abstract]' +
      ') AND (' +
      '"mental health"[Title/Abstract] OR wellbeing[Title/Abstract] OR "well-being"[Title/Abstract] OR ' +
      'anxiety[Title/Abstract] OR depression[Title/Abstract] OR coping[Title/Abstract]' +
      ')',
  },

  // 9. Confirmation bias, self-fulfilling prophecy
  {
    name: 'Cognitive Biases & Belief Formation',
    query:
      '(' +
      '"confirmation bias"[Title/Abstract] OR "optimism bias"[Title/Abstract] OR ' +
      '"self-fulfilling prophecy"[Title/Abstract] OR "behavioral confirmation"[Title/Abstract] OR ' +
      '"motivated reasoning"[Title/Abstract] OR "imagination inflation"[Title/Abstract]' +
      ') AND (' +
      'belief[Title/Abstract] OR expectation[Title/Abstract] OR behavior[Title/Abstract] OR ' +
      'behaviour[Title/Abstract] OR outcome[Title/Abstract]' +
      ')',
  },

  // 10. Affirmations and self-affirmation
  {
    name: 'Affirmations & Self-Talk',
    query:
      '(' +
      '"self-affirmation"[Title/Abstract] OR affirmations[Title/Abstract] OR ' +
      '"self-talk"[Title/Abstract] OR "positive thinking"[Title/Abstract]' +
      ') AND (' +
      'well-being[Title/Abstract] OR wellbeing[Title/Abstract] OR "mental health"[Title/Abstract] OR ' +
      'performance[Title/Abstract] OR "self-esteem"[Title/Abstract] OR motivation[Title/Abstract]' +
      ')',
  },
];

// Date range helper: returns the date string for N days ago in YYYY/MM/DD format
export function getDateNDaysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}/${m}/${day}`;
}
