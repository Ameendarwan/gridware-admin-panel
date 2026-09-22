import { EdgeGroup, EdgeSpans } from '@app/pages/Deployments/components/MapBox/types';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

import { RootState } from '@app/store';
import { setEdgesMap } from '@app/store/slices/edgesSlice';

type Pole = NonNullable<RootState['poles']['polesList']>[number];
type Edge = NonNullable<RootState['edges']['edgesList']>[number];

/**
 * Creates coordinates array from two poles
 */
const createCoordinates = (fromPole: Pole, toPole: Pole): [number, number][] => {
  return [
    [fromPole.long, fromPole.lat],
    [toPole.long, toPole.lat],
  ];
};

/**
 * Finds an existing edge group that matches the given edge
 */
const findExistingGroup = (edgeGroups: EdgeGroup[], edge: Edge): EdgeGroup | undefined => {
  return edgeGroups.find(
    group =>
      (group.from_pole_id === edge.from_pole_id && group.to_pole_id === edge.to_pole_id) ||
      (group.from_pole_id === edge.to_pole_id && group.to_pole_id === edge.from_pole_id)
  );
};

/**
 * Creates a new edge group
 */
const createEdgeGroup = (edge: Edge, deploymentId: number, coordinates: [number, number][]): EdgeGroup => {
  return {
    from_pole_id: edge.from_pole_id,
    to_pole_id: edge.to_pole_id,
    id: edge.id,
    lines: [],
    deployment_id: deploymentId,
    coordinates,
    color: edge.isNew ? edge?.color : '',
  };
};

/**
 * Processes a single edge and updates edge groups
 */
const processEdge = (edge: Edge, poles: Pole[], deploymentId: number | undefined, edgeGroups: EdgeGroup[]): void => {
  const fromPole = poles?.find(pole => pole.id === edge.from_pole_id);
  const toPole = poles?.find(pole => pole.id === edge.to_pole_id);

  if (!fromPole || !toPole) {
    return;
  }

  const coordinates = createCoordinates(fromPole, toPole);
  let existingGroup = findExistingGroup(edgeGroups, edge);

  if (!existingGroup && deploymentId) {
    existingGroup = createEdgeGroup(edge, deploymentId, coordinates);
    edgeGroups.push(existingGroup);
  }
};

/**
 * Custom hook to process and organize edges and poles data.
 *
 * This hook processes the list of poles and edges to organize the edge spans into groups based on their connections
 * (from and to pole). It categorizes the edges into primary, transmission, and secondary lines, and constructs
 * edge groups which include the relevant line configurations.
 *
 * It uses the `useEffect` hook to trigger the processing when the poles and edges data change. Additionally, it stores
 * the processed edge data in the Redux store using `setEdgesMap` and returns the processed edges.
 *
 * Dependencies:
 * - `poles`: List of poles fetched from the Redux store.
 * - `edges`: List of edges fetched from the Redux store.
 * - `deploymentId`: Current deployment ID fetched from the Redux store.
 * - `dispatch`: Dispatch function to send actions to the Redux store.
 *
 * The hook also:
 * - Organizes the edges into groups, each with its corresponding from and to pole.
 * - Filters and maps the edge spans into categorized lines based on their type (Primary, Transmission, Secondary).
 * - Updates the Redux store with a map of edges where each edge is mapped by its ID along with its line configurations.
 *
 * @returns {Object} - An object containing:
 *   - `processedEdges`: The list of edge groups after processing and categorization.
 *   - `setProcessedEdges`: Function to update the processed edges state.
 */
const useEdgeProcessing = () => {
  const [processedEdges, setProcessedEdges] = useState<EdgeGroup[]>([]);
  const poles = useSelector((state: RootState) => state.poles.polesList);
  const edges = useSelector((state: RootState) => state.edges.edgesList);
  const deploymentId = useSelector((state: RootState) => state.edges.deploymentId);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!poles || !edges) {
      return;
    }

    const edgeGroups: EdgeGroup[] = [];
    const edgesMap = new Map<number, EdgeSpans>();

    // Process each edge
    for (const edge of edges ?? []) {
      processEdge(edge, poles, deploymentId, edgeGroups);
      edgesMap.set(edge.id, { ...edge });
    }

    // Update the Redux store with the processed edges map
    if (edgesMap.size > 0) {
      dispatch(setEdgesMap(Object.fromEntries(edgesMap.entries())));
    }

    // Update the state with the processed edge groups
    setProcessedEdges(edgeGroups);
  }, [poles, edges, deploymentId, dispatch]);

  return { processedEdges, setProcessedEdges };
};

export default useEdgeProcessing;
