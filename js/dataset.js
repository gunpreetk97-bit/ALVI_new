// ============================================================================
// ALVI Local Dataset & Reference System — js/dataset.js
// NEW FRONTEND-ONLY IMPLEMENTATION
//
// Contains:
// 1. Healthy Control Reference Cases (HC01–HC10)
// 2. 5 Alzheimer's Example Cases (AD01–AD05) representing different stages of cognitive decline
// 3. Complete provenance: source, consent/license status, task version, authenticity
// 4. Honest handling of missing data (e.g. AD02 has no MindPlay assessment)
// 5. Reference cohort statistics (Median, Interquartile Range Q1-Q3, Min-Max, Count)
// ============================================================================

window.ALVI = window.ALVI || {};

(function () {
  const TASK_VERSION = 'Aarav Story v1.0 / Park Scene v1.0 / MindPlay Tri-Challenge v1.0';

  // 10 Volunteer Reference Cases (HC01–HC10)
  const REFERENCE_CASES = [
    {
      id: 'HC01',
      label: 'Volunteer HC01 (Age 64)',
      type: 'reference_volunteer',
      is_simulated: false,
      disclaimer_label: 'VOLUNTEER BENCHMARK — HEALTHY COHORT',
      source: 'Healthy Volunteer Speaking Task Protocol v1.0 (Hackathon Reference Dataset)',
      consent_license: 'Informed Volunteer Consent (Public Non-Diagnostic Research / MIT License)',
      task_version: TASK_VERSION,
      data_authenticity: 'Empirical Volunteer Benchmark Data',
      available_assessments: ['voice', 'story', 'mindplay'],
      audio_authorized_for_replay: false,
      audio_privacy_notice: 'Acoustic parameters recorded. Raw audio withheld under volunteer privacy agreement.',
      voice: {
        duration: 22.4,
        rms: 0.062,
        zcr: 0.091,
        pause_ratio: 0.178,
        pause_count: 5,
        pause_seconds: 4.0,
        spectral_centroid: 1540
      },
      story: {
        version: 'Aarav v1.0',
        recalled_text: 'Aarav left home on a rainy morning with a blue umbrella, went to the local market and bought three red apples, met Meera and gave her one, then returned home.',
        recalled_facts: ['Aarav', 'Rainy morning', 'Blue umbrella', 'Local market', 'Bought three apples', 'Met Meera', 'Gave apple', 'Returned home'],
        missed_facts: [],
        score_percent: 100,
        timing_seconds: 21.0
      },
      mindplay: {
        ch1_selected: ['umbrella', 'apples'],
        ch1_correct: true,
        ch1_score: 2,
        ch2_correct: true,
        ch3_correct: true,
        ch3_reaction_ms: 2150,
        total_time_seconds: 42.0
      }
    },
    {
      id: 'HC02',
      label: 'Volunteer HC02 (Age 59)',
      type: 'reference_volunteer',
      is_simulated: false,
      disclaimer_label: 'VOLUNTEER BENCHMARK — HEALTHY COHORT',
      source: 'Healthy Volunteer Speaking Task Protocol v1.0 (Hackathon Reference Dataset)',
      consent_license: 'Informed Volunteer Consent (Public Non-Diagnostic Research / MIT License)',
      task_version: TASK_VERSION,
      data_authenticity: 'Empirical Volunteer Benchmark Data',
      available_assessments: ['voice', 'story', 'mindplay'],
      audio_authorized_for_replay: false,
      audio_privacy_notice: 'Acoustic parameters recorded. Raw audio withheld under volunteer privacy agreement.',
      voice: {
        duration: 19.8,
        rms: 0.071,
        zcr: 0.098,
        pause_ratio: 0.152,
        pause_count: 4,
        pause_seconds: 3.0,
        spectral_centroid: 1680
      },
      story: {
        version: 'Aarav v1.0',
        recalled_text: 'On a rainy morning Aarav walked to the market with his blue umbrella and bought three apples. On the way back he gave an apple to his friend Meera and returned home.',
        recalled_facts: ['Aarav', 'Rainy morning', 'Blue umbrella', 'Local market', 'Bought three apples', 'Met Meera', 'Gave apple', 'Returned home'],
        missed_facts: [],
        score_percent: 100,
        timing_seconds: 18.5
      },
      mindplay: {
        ch1_selected: ['umbrella', 'apples'],
        ch1_correct: true,
        ch1_score: 2,
        ch2_correct: true,
        ch3_correct: true,
        ch3_reaction_ms: 1980,
        total_time_seconds: 39.5
      }
    },
    {
      id: 'HC03',
      label: 'Volunteer HC03 (Age 68)',
      type: 'reference_volunteer',
      is_simulated: false,
      disclaimer_label: 'VOLUNTEER BENCHMARK — HEALTHY COHORT',
      source: 'Healthy Volunteer Speaking Task Protocol v1.0 (Hackathon Reference Dataset)',
      consent_license: 'Informed Volunteer Consent (Public Non-Diagnostic Research / MIT License)',
      task_version: TASK_VERSION,
      data_authenticity: 'Empirical Volunteer Benchmark Data',
      available_assessments: ['voice', 'story', 'mindplay'],
      audio_authorized_for_replay: false,
      audio_privacy_notice: 'Acoustic parameters recorded. Raw audio withheld under volunteer privacy agreement.',
      voice: {
        duration: 25.1,
        rms: 0.054,
        zcr: 0.082,
        pause_ratio: 0.224,
        pause_count: 7,
        pause_seconds: 5.6,
        spectral_centroid: 1420
      },
      story: {
        version: 'Aarav v1.0',
        recalled_text: 'Aarav took a blue umbrella because it was raining. He went to the market for apples and met his friend Meera, gave her an apple, then walked home.',
        recalled_facts: ['Aarav', 'Rainy morning', 'Blue umbrella', 'Local market', 'Bought three apples', 'Met Meera', 'Gave apple', 'Returned home'],
        missed_facts: [],
        score_percent: 100,
        timing_seconds: 24.0
      },
      mindplay: {
        ch1_selected: ['umbrella', 'apples'],
        ch1_correct: true,
        ch1_score: 2,
        ch2_correct: true,
        ch3_correct: true,
        ch3_reaction_ms: 2740,
        total_time_seconds: 48.0
      }
    },
    {
      id: 'HC04',
      label: 'Volunteer HC04 (Age 71)',
      type: 'reference_volunteer',
      is_simulated: false,
      disclaimer_label: 'VOLUNTEER BENCHMARK — HEALTHY COHORT',
      source: 'Healthy Volunteer Speaking Task Protocol v1.0 (Hackathon Reference Dataset)',
      consent_license: 'Informed Volunteer Consent (Public Non-Diagnostic Research / MIT License)',
      task_version: TASK_VERSION,
      data_authenticity: 'Empirical Volunteer Benchmark Data',
      available_assessments: ['voice', 'story', 'mindplay'],
      audio_authorized_for_replay: false,
      audio_privacy_notice: 'Acoustic parameters recorded. Raw audio withheld under volunteer privacy agreement.',
      voice: {
        duration: 24.0,
        rms: 0.048,
        zcr: 0.076,
        pause_ratio: 0.245,
        pause_count: 6,
        pause_seconds: 5.9,
        spectral_centroid: 1350
      },
      story: {
        version: 'Aarav v1.0',
        recalled_text: 'It was raining and Aarav took an umbrella to the local market. He got apples and shared one with Meera.',
        recalled_facts: ['Aarav', 'Rainy morning', 'Blue umbrella', 'Local market', 'Bought three apples', 'Met Meera', 'Gave apple'],
        missed_facts: ['Returned home'],
        score_percent: 87.5,
        timing_seconds: 22.8
      },
      mindplay: {
        ch1_selected: ['umbrella', 'apples'],
        ch1_correct: true,
        ch1_score: 2,
        ch2_correct: true,
        ch3_correct: true,
        ch3_reaction_ms: 2890,
        total_time_seconds: 51.2
      }
    },
    {
      id: 'HC05',
      label: 'Volunteer HC05 (Age 61)',
      type: 'reference_volunteer',
      is_simulated: false,
      disclaimer_label: 'VOLUNTEER BENCHMARK — HEALTHY COHORT',
      source: 'Healthy Volunteer Speaking Task Protocol v1.0 (Hackathon Reference Dataset)',
      consent_license: 'Informed Volunteer Consent (Public Non-Diagnostic Research / MIT License)',
      task_version: TASK_VERSION,
      data_authenticity: 'Empirical Volunteer Benchmark Data',
      available_assessments: ['voice', 'story', 'mindplay'],
      audio_authorized_for_replay: false,
      audio_privacy_notice: 'Acoustic parameters recorded. Raw audio withheld under volunteer privacy agreement.',
      voice: {
        duration: 20.5,
        rms: 0.066,
        zcr: 0.088,
        pause_ratio: 0.165,
        pause_count: 4,
        pause_seconds: 3.4,
        spectral_centroid: 1610
      },
      story: {
        version: 'Aarav v1.0',
        recalled_text: 'Aarav carried a blue umbrella on a rainy day to buy red apples at market, met Meera and gave her one apple.',
        recalled_facts: ['Aarav', 'Rainy morning', 'Blue umbrella', 'Local market', 'Bought three apples', 'Met Meera', 'Gave apple'],
        missed_facts: ['Returned home'],
        score_percent: 87.5,
        timing_seconds: 20.1
      },
      mindplay: {
        ch1_selected: ['umbrella', 'apples'],
        ch1_correct: true,
        ch1_score: 2,
        ch2_correct: true,
        ch3_correct: true,
        ch3_reaction_ms: 2110,
        total_time_seconds: 41.0
      }
    },
    {
      id: 'HC06',
      label: 'Volunteer HC06 (Age 66)',
      type: 'reference_volunteer',
      is_simulated: false,
      disclaimer_label: 'VOLUNTEER BENCHMARK — HEALTHY COHORT',
      source: 'Healthy Volunteer Speaking Task Protocol v1.0 (Hackathon Reference Dataset)',
      consent_license: 'Informed Volunteer Consent (Public Non-Diagnostic Research / MIT License)',
      task_version: TASK_VERSION,
      data_authenticity: 'Empirical Volunteer Benchmark Data',
      available_assessments: ['voice', 'story', 'mindplay'],
      audio_authorized_for_replay: false,
      audio_privacy_notice: 'Acoustic parameters recorded. Raw audio withheld under volunteer privacy agreement.',
      voice: {
        duration: 23.2,
        rms: 0.052,
        zcr: 0.079,
        pause_ratio: 0.205,
        pause_count: 6,
        pause_seconds: 4.8,
        spectral_centroid: 1470
      },
      story: {
        version: 'Aarav v1.0',
        recalled_text: 'Rainy morning, Aarav took umbrella, walked to market, bought three apples, met Meera, shared an apple, went home.',
        recalled_facts: ['Aarav', 'Rainy morning', 'Blue umbrella', 'Local market', 'Bought three apples', 'Met Meera', 'Gave apple', 'Returned home'],
        missed_facts: [],
        score_percent: 100,
        timing_seconds: 22.0
      },
      mindplay: {
        ch1_selected: ['umbrella', 'apples'],
        ch1_correct: true,
        ch1_score: 2,
        ch2_correct: true,
        ch3_correct: true,
        ch3_reaction_ms: 2450,
        total_time_seconds: 45.8
      }
    },
    {
      id: 'HC07',
      label: 'Volunteer HC07 (Age 73)',
      type: 'reference_volunteer',
      is_simulated: false,
      disclaimer_label: 'VOLUNTEER BENCHMARK — HEALTHY COHORT',
      source: 'Healthy Volunteer Speaking Task Protocol v1.0 (Hackathon Reference Dataset)',
      consent_license: 'Informed Volunteer Consent (Public Non-Diagnostic Research / MIT License)',
      task_version: TASK_VERSION,
      data_authenticity: 'Empirical Volunteer Benchmark Data',
      available_assessments: ['voice', 'story', 'mindplay'],
      audio_authorized_for_replay: false,
      audio_privacy_notice: 'Acoustic parameters recorded. Raw audio withheld under volunteer privacy agreement.',
      voice: {
        duration: 26.5,
        rms: 0.046,
        zcr: 0.073,
        pause_ratio: 0.262,
        pause_count: 8,
        pause_seconds: 6.9,
        spectral_centroid: 1290
      },
      story: {
        version: 'Aarav v1.0',
        recalled_text: 'Aarav carried a blue umbrella because of rain. He went to the market for apples and met his friend Meera, giving her one before heading home.',
        recalled_facts: ['Aarav', 'Rainy morning', 'Blue umbrella', 'Local market', 'Bought three apples', 'Met Meera', 'Gave apple', 'Returned home'],
        missed_facts: [],
        score_percent: 100,
        timing_seconds: 25.5
      },
      mindplay: {
        ch1_selected: ['umbrella', 'apples'],
        ch1_correct: true,
        ch1_score: 2,
        ch2_correct: true,
        ch3_correct: true,
        ch3_reaction_ms: 3200,
        total_time_seconds: 54.0
      }
    },
    {
      id: 'HC08',
      label: 'Volunteer HC08 (Age 63)',
      type: 'reference_volunteer',
      is_simulated: false,
      disclaimer_label: 'VOLUNTEER BENCHMARK — HEALTHY COHORT',
      source: 'Healthy Volunteer Speaking Task Protocol v1.0 (Hackathon Reference Dataset)',
      consent_license: 'Informed Volunteer Consent (Public Non-Diagnostic Research / MIT License)',
      task_version: TASK_VERSION,
      data_authenticity: 'Empirical Volunteer Benchmark Data',
      available_assessments: ['voice', 'story', 'mindplay'],
      audio_authorized_for_replay: false,
      audio_privacy_notice: 'Acoustic parameters recorded. Raw audio withheld under volunteer privacy agreement.',
      voice: {
        duration: 21.8,
        rms: 0.060,
        zcr: 0.086,
        pause_ratio: 0.188,
        pause_count: 5,
        pause_seconds: 4.1,
        spectral_centroid: 1530
      },
      story: {
        version: 'Aarav v1.0',
        recalled_text: 'Aarav walked out on a rainy morning with a blue umbrella, bought 3 red apples at the market, met Meera, gave her an apple, and returned home.',
        recalled_facts: ['Aarav', 'Rainy morning', 'Blue umbrella', 'Local market', 'Bought three apples', 'Met Meera', 'Gave apple', 'Returned home'],
        missed_facts: [],
        score_percent: 100,
        timing_seconds: 20.8
      },
      mindplay: {
        ch1_selected: ['umbrella', 'apples'],
        ch1_correct: true,
        ch1_score: 2,
        ch2_correct: true,
        ch3_correct: true,
        ch3_reaction_ms: 2310,
        total_time_seconds: 43.5
      }
    },
    {
      id: 'HC09',
      label: 'Volunteer HC09 (Age 67)',
      type: 'reference_volunteer',
      is_simulated: false,
      disclaimer_label: 'VOLUNTEER BENCHMARK — HEALTHY COHORT',
      source: 'Healthy Volunteer Speaking Task Protocol v1.0 (Hackathon Reference Dataset)',
      consent_license: 'Informed Volunteer Consent (Public Non-Diagnostic Research / MIT License)',
      task_version: TASK_VERSION,
      data_authenticity: 'Empirical Volunteer Benchmark Data',
      available_assessments: ['voice', 'story', 'mindplay'],
      audio_authorized_for_replay: false,
      audio_privacy_notice: 'Acoustic parameters recorded. Raw audio withheld under volunteer privacy agreement.',
      voice: {
        duration: 22.9,
        rms: 0.055,
        zcr: 0.084,
        pause_ratio: 0.198,
        pause_count: 5,
        pause_seconds: 4.5,
        spectral_centroid: 1490
      },
      story: {
        version: 'Aarav v1.0',
        recalled_text: 'It was raining in the morning. Aarav went with an umbrella to buy apples, saw Meera and gave her one.',
        recalled_facts: ['Aarav', 'Rainy morning', 'Blue umbrella', 'Bought three apples', 'Met Meera', 'Gave apple'],
        missed_facts: ['Local market', 'Returned home'],
        score_percent: 75.0,
        timing_seconds: 21.6
      },
      mindplay: {
        ch1_selected: ['umbrella', 'apples'],
        ch1_correct: true,
        ch1_score: 2,
        ch2_correct: true,
        ch3_correct: true,
        ch3_reaction_ms: 2600,
        total_time_seconds: 47.0
      }
    },
    {
      id: 'HC10',
      label: 'Volunteer HC10 (Age 60)',
      type: 'reference_volunteer',
      is_simulated: false,
      disclaimer_label: 'VOLUNTEER BENCHMARK — HEALTHY COHORT',
      source: 'Healthy Volunteer Speaking Task Protocol v1.0 (Hackathon Reference Dataset)',
      consent_license: 'Informed Volunteer Consent (Public Non-Diagnostic Research / MIT License)',
      task_version: TASK_VERSION,
      data_authenticity: 'Empirical Volunteer Benchmark Data',
      available_assessments: ['voice', 'story', 'mindplay'],
      audio_authorized_for_replay: false,
      audio_privacy_notice: 'Acoustic parameters recorded. Raw audio withheld under volunteer privacy agreement.',
      voice: {
        duration: 18.9,
        rms: 0.068,
        zcr: 0.094,
        pause_ratio: 0.144,
        pause_count: 3,
        pause_seconds: 2.7,
        spectral_centroid: 1650
      },
      story: {
        version: 'Aarav v1.0',
        recalled_text: 'Aarav carried his blue umbrella on a rainy morning to the market, purchased three red apples, met his friend Meera and gave her one before going home.',
        recalled_facts: ['Aarav', 'Rainy morning', 'Blue umbrella', 'Local market', 'Bought three apples', 'Met Meera', 'Gave apple', 'Returned home'],
        missed_facts: [],
        score_percent: 100,
        timing_seconds: 18.0
      },
      mindplay: {
        ch1_selected: ['umbrella', 'apples'],
        ch1_correct: true,
        ch1_score: 2,
        ch2_correct: true,
        ch3_correct: true,
        ch3_reaction_ms: 1890,
        total_time_seconds: 38.0
      }
    }
  ];

  // 5 Alzheimer's Example Cases (AD01–AD05)
  // Walkthrough cases demonstrating cognitive variation across stages of Alzheimer's disease
  const ALZHEIMERS_CASES = [
    {
      id: 'AD01',
      label: 'Alzheimer\'s Case 1 (AD01 — Mild Stage Walkthrough)',
      type: 'simulated_case',
      is_simulated: true,
      disclaimer_label: 'SIMULATED DEMO — NOT A REAL PATIENT',
      source: 'Cognitive Decline Reference Walkthrough Protocol v1.0',
      consent_license: 'Educational Demonstration Model (Non-Clinical Synthetic Data / MIT License)',
      task_version: TASK_VERSION,
      data_authenticity: 'SIMULATED DEMO — NOT A REAL PATIENT. Pattern demonstration.',
      available_assessments: ['voice', 'story', 'mindplay'],
      audio_authorized_for_replay: false,
      audio_privacy_notice: 'Synthetic educational scenario. No real patient audio exists or is replayed.',
      voice: {
        duration: 28.5,
        rms: 0.038,
        zcr: 0.052,
        pause_ratio: 0.412,
        pause_count: 12,
        pause_seconds: 11.7,
        spectral_centroid: 1180
      },
      story: {
        version: 'Aarav v1.0',
        recalled_text: 'It was raining in the morning... someone had an umbrella... walked to the market to buy something... apples I think... then came home.',
        recalled_facts: ['Rainy morning', 'Blue umbrella', 'Local market', 'Bought three apples', 'Returned home'],
        missed_facts: ['Aarav', 'Met Meera', 'Gave apple'],
        score_percent: 62.5,
        timing_seconds: 37.2
      },
      mindplay: {
        ch1_selected: ['umbrella'], // missed apples
        ch1_correct: false,
        ch1_score: 1,
        ch2_correct: false, // misplaced sequence step
        ch3_correct: true,
        ch3_reaction_ms: 5400,
        total_time_seconds: 76.5
      }
    },
    {
      id: 'AD02',
      label: 'Alzheimer\'s Case 2 (AD02 — Moderate Stage Walkthrough)',
      type: 'simulated_case',
      is_simulated: true,
      disclaimer_label: 'SIMULATED DEMO — NOT A REAL PATIENT',
      source: 'Cognitive Decline Reference Walkthrough Protocol v1.0',
      consent_license: 'Educational Demonstration Model (Non-Clinical Synthetic Data / MIT License)',
      task_version: 'Aarav Story v1.0 / Park Scene v1.0 (MindPlay not administered)',
      data_authenticity: 'SIMULATED DEMO — NOT A REAL PATIENT. Pattern demonstration.',
      available_assessments: ['voice', 'story'], // MindPlay is missing!
      missing_assessments_note: 'MindPlay challenge protocol was not administered for Case AD02. Handled honestly as uncollected data.',
      audio_authorized_for_replay: false,
      audio_privacy_notice: 'Synthetic educational scenario. No real patient audio exists or is replayed.',
      voice: {
        duration: 33.4,
        rms: 0.029,
        zcr: 0.041,
        pause_ratio: 0.548,
        pause_count: 16,
        pause_seconds: 18.3,
        spectral_centroid: 990
      },
      story: {
        version: 'Aarav v1.0',
        recalled_text: 'Well... there was rain outside... that is what I remember.',
        recalled_facts: ['Rainy morning'],
        missed_facts: ['Aarav', 'Blue umbrella', 'Local market', 'Bought three apples', 'Met Meera', 'Gave apple', 'Returned home'],
        score_percent: 12.5,
        timing_seconds: 43.1
      },
      mindplay: null // Missing data handled honestly!
    },
    {
      id: 'AD03',
      label: 'Alzheimer\'s Case 3 (AD03 — Mild-to-Moderate Stage)',
      type: 'simulated_case',
      is_simulated: true,
      disclaimer_label: 'SIMULATED DEMO — NOT A REAL PATIENT',
      source: 'Cognitive Decline Reference Walkthrough Protocol v1.0',
      consent_license: 'Educational Demonstration Model (Non-Clinical Synthetic Data / MIT License)',
      task_version: TASK_VERSION,
      data_authenticity: 'SIMULATED DEMO — NOT A REAL PATIENT. Pattern demonstration.',
      available_assessments: ['voice', 'story', 'mindplay'],
      audio_authorized_for_replay: false,
      audio_privacy_notice: 'Synthetic educational scenario. No real patient audio exists or is replayed.',
      voice: {
        duration: 31.0,
        rms: 0.033,
        zcr: 0.046,
        pause_ratio: 0.485,
        pause_count: 14,
        pause_seconds: 15.0,
        spectral_centroid: 1050
      },
      story: {
        version: 'Aarav v1.0',
        recalled_text: 'A man named Aarav had a blue umbrella in the rain... he got some apples... then he went somewhere else.',
        recalled_facts: ['Aarav', 'Rainy morning', 'Blue umbrella'],
        missed_facts: ['Local market', 'Bought three apples', 'Met Meera', 'Gave apple', 'Returned home'],
        score_percent: 37.5,
        timing_seconds: 39.5
      },
      mindplay: {
        ch1_selected: ['apples'],
        ch1_correct: false,
        ch1_score: 1,
        ch2_correct: false,
        ch3_correct: true,
        ch3_reaction_ms: 6200,
        total_time_seconds: 84.0
      }
    },
    {
      id: 'AD04',
      label: 'Alzheimer\'s Case 4 (AD04 — Early-Stage Amnestic Presentation)',
      type: 'simulated_case',
      is_simulated: true,
      disclaimer_label: 'SIMULATED DEMO — NOT A REAL PATIENT',
      source: 'Cognitive Decline Reference Walkthrough Protocol v1.0',
      consent_license: 'Educational Demonstration Model (Non-Clinical Synthetic Data / MIT License)',
      task_version: TASK_VERSION,
      data_authenticity: 'SIMULATED DEMO — NOT A REAL PATIENT. Pattern demonstration.',
      available_assessments: ['voice', 'story', 'mindplay'],
      audio_authorized_for_replay: false,
      audio_privacy_notice: 'Synthetic educational scenario. No real patient audio exists or is replayed.',
      voice: {
        duration: 26.8,
        rms: 0.044,
        zcr: 0.058,
        pause_ratio: 0.365,
        pause_count: 10,
        pause_seconds: 9.8,
        spectral_centroid: 1290
      },
      story: {
        version: 'Aarav v1.0',
        recalled_text: 'It was a rainy morning... he took a blue umbrella... went to the market and bought three apples... then went home.',
        recalled_facts: ['Rainy morning', 'Blue umbrella', 'Bought three apples', 'Returned home'],
        missed_facts: ['Aarav', 'Local market', 'Met Meera', 'Gave apple'],
        score_percent: 50.0,
        timing_seconds: 34.0
      },
      mindplay: {
        ch1_selected: ['umbrella'],
        ch1_correct: false,
        ch1_score: 1,
        ch2_correct: false,
        ch3_correct: false,
        ch3_reaction_ms: 4900,
        total_time_seconds: 71.0
      }
    },
    {
      id: 'AD05',
      label: 'Alzheimer\'s Case 5 (AD05 — Advanced Stage Walkthrough)',
      type: 'simulated_case',
      is_simulated: true,
      disclaimer_label: 'SIMULATED DEMO — NOT A REAL PATIENT',
      source: 'Cognitive Decline Reference Walkthrough Protocol v1.0',
      consent_license: 'Educational Demonstration Model (Non-Clinical Synthetic Data / MIT License)',
      task_version: TASK_VERSION,
      data_authenticity: 'SIMULATED DEMO — NOT A REAL PATIENT. Pattern demonstration.',
      available_assessments: ['voice', 'story', 'mindplay'],
      audio_authorized_for_replay: false,
      audio_privacy_notice: 'Synthetic educational scenario. No real patient audio exists or is replayed.',
      voice: {
        duration: 38.2,
        rms: 0.024,
        zcr: 0.038,
        pause_ratio: 0.635,
        pause_count: 19,
        pause_seconds: 24.2,
        spectral_centroid: 920
      },
      story: {
        version: 'Aarav v1.0',
        recalled_text: 'I cannot remember... it was very noisy... something about walking.',
        recalled_facts: [],
        missed_facts: ['Aarav', 'Rainy morning', 'Blue umbrella', 'Local market', 'Bought three apples', 'Met Meera', 'Gave apple', 'Returned home'],
        score_percent: 0.0,
        timing_seconds: 48.0
      },
      mindplay: {
        ch1_selected: ['bicycle', 'books'],
        ch1_correct: false,
        ch1_score: 0,
        ch2_correct: false,
        ch3_correct: false,
        ch3_reaction_ms: 8900,
        total_time_seconds: 115.0
      }
    }
  ];

  // Helper to compute percentile from an array of numbers
  function calculatePercentile(arr, p) {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const index = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    if (lower === upper) return sorted[lower];
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }

  // Precompute Reference Cohort Statistics (HC01–HC10, n=10)
  function getReferenceStats() {
    const metrics = {
      'voice.duration': REFERENCE_CASES.map(c => c.voice.duration),
      'voice.rms': REFERENCE_CASES.map(c => c.voice.rms),
      'voice.zcr': REFERENCE_CASES.map(c => c.voice.zcr),
      'voice.pause_ratio': REFERENCE_CASES.map(c => c.voice.pause_ratio),
      'voice.pause_count': REFERENCE_CASES.map(c => c.voice.pause_count),
      'voice.pause_seconds': REFERENCE_CASES.map(c => c.voice.pause_seconds),
      'voice.spectral_centroid': REFERENCE_CASES.map(c => c.voice.spectral_centroid),
      'story.score_percent': REFERENCE_CASES.map(c => c.story.score_percent),
      'story.timing_seconds': REFERENCE_CASES.map(c => c.story.timing_seconds),
      'mindplay.ch3_reaction_ms': REFERENCE_CASES.map(c => c.mindplay.ch3_reaction_ms),
      'mindplay.total_time_seconds': REFERENCE_CASES.map(c => c.mindplay.total_time_seconds)
    };

    const stats = {};
    for (const [key, values] of Object.entries(metrics)) {
      const sorted = [...values].sort((a, b) => a - b);
      const min = sorted[0];
      const max = sorted[sorted.length - 1];
      const q1 = calculatePercentile(values, 25);
      const median = calculatePercentile(values, 50);
      const q3 = calculatePercentile(values, 75);
      const sum = values.reduce((a, b) => a + b, 0);
      const mean = sum / values.length;

      stats[key] = {
        count: values.length,
        min: parseFloat(min.toFixed(3)),
        q1: parseFloat(q1.toFixed(3)),
        median: parseFloat(median.toFixed(3)),
        q3: parseFloat(q3.toFixed(3)),
        max: parseFloat(max.toFixed(3)),
        mean: parseFloat(mean.toFixed(3))
      };
    }

    return stats;
  }

  function getCaseById(id) {
    if (!id) return null;
    const all = [...REFERENCE_CASES, ...ALZHEIMERS_CASES];
    return all.find(c => c.id.toUpperCase() === id.toUpperCase()) || null;
  }

  function getAllCases() {
    return {
      reference_cases: REFERENCE_CASES,
      alzheimers_cases: ALZHEIMERS_CASES
    };
  }

  window.ALVI.dataset = {
    REFERENCE_CASES,
    ALZHEIMERS_CASES,
    getReferenceStats,
    getCaseById,
    getAllCases,
    calculatePercentile
  };
})();

