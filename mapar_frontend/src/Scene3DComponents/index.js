import { CoordinateSystem } from '../Scene3DComponents';
import { ConnectionLines } from './ConnectionLines';
import { CoordinateHelper } from './CoordinateHelper';
import { ModelLoader } from './ModelLoader';
import { ModelControls } from './ModelControls';

export { 
  CoordinateSystem, 
  ConnectionLines, 
  CoordinateHelper,
  ModelLoader,
  ModelControls 
};

export function ConnectionLines({ nodes, connections }) {
  if (!nodes || !connections) return null;

  return connections.map(conn => {
    const fromNode = nodes.find(n => n.id === conn.from);
    const toNode = nodes.find(n => n.id === conn.to);
    
    if (fromNode && toNode) {
      const fromPos = fromNode.translation.split(',').map(Number);
      const toPos = toNode.translation.split(',').map(Number);
      
      return (
        <Line
          key={`${conn.from}-${conn.to}`}
          points={[fromPos, toPos]}
          color="#4444ff"
          lineWidth={1}
        />
      );
    }
    return null;
  });
}

ConnectionLines.propTypes = {
  nodes: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    translation: PropTypes.string.isRequired
  })),
  connections: PropTypes.arrayOf(PropTypes.shape({
    from: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    to: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
  }))
};
