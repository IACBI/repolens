import type { DependencyEdge } from "../types/index.js";

export function dependencyDegree(edges: DependencyEdge[]): Map<string, { incoming: number; outgoing: number }> {
  const degree = new Map<string, { incoming: number; outgoing: number }>();

  for (const edge of edges) {
    const from = degree.get(edge.from) ?? { incoming: 0, outgoing: 0 };
    from.outgoing += 1;
    degree.set(edge.from, from);

    const to = degree.get(edge.to) ?? { incoming: 0, outgoing: 0 };
    to.incoming += 1;
    degree.set(edge.to, to);
  }

  return degree;
}
