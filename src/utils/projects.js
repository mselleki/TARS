export function buildProjectTree(projects, parentId = null) {
  return projects
    .filter((p) => (p.parentProjectId ?? null) === parentId)
    .map((p) => ({
      ...p,
      children: buildProjectTree(projects, p.id),
    }))
}

export function flattenProjectsForSelect(projects, parentId = null, depth = 0) {
  return projects
    .filter((p) => (p.parentProjectId ?? null) === parentId)
    .flatMap((p) => [{ ...p, depth }, ...flattenProjectsForSelect(projects, p.id, depth + 1)])
}

export function getProjectPath(projects, projectId) {
  const path = []
  let current = projects.find((p) => p.id === projectId)
  while (current) {
    path.unshift(current.title)
    current = current.parentProjectId
      ? projects.find((p) => p.id === current.parentProjectId)
      : null
  }
  return path
}

/** Returns [projectId, ...all descendant ids] for filtering by sub-project */
export function getProjectIdsInSubtree(projects, projectId) {
  if (!projectId) return []
  const ids = [projectId]
  projects
    .filter((p) => p.parentProjectId === projectId)
    .forEach((p) => ids.push(...getProjectIdsInSubtree(projects, p.id)))
  return ids
}
