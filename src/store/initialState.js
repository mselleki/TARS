export function createInitialTask(overrides = {}) {
  const now = Date.now()
  return {
    id: crypto.randomUUID(),
    title: '',
    status: 'backlog',
    priority: 'medium',
    energy: 'quick',
    dueDate: '',
    note: '',
    disliked: false,
    ritualId: null,
    projectId: null,
    context: 'pro',
    domainIds: [],
    countryIds: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

export function createInitialRitual(overrides = {}) {
  return {
    id: crypto.randomUUID(),
    name: '',
    schedule: { type: 'daily', days: [0, 1, 2, 3, 4, 5, 6] },
    questions: ['', '', ''],
    suggestedActions: ['', '', ''],
    ...overrides,
  }
}

export function createInitialProject(overrides = {}) {
  const now = Date.now()
  return {
    id: crypto.randomUUID(),
    title: '',
    context: 'pro',
    parentProjectId: null,
    dueDate: '',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

export function createInitialDailyPlan(date, overrides = {}) {
  return {
    date,
    focusTaskIds: [],
    reflection: {},
    ...overrides,
  }
}
