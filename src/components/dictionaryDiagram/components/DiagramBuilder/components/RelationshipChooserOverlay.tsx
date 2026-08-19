import {
  RelationshipChoice,
  RelationshipChooser,
} from '@/components/dictionaryDiagram/components/RelationshipChooset';
import { ChooserState } from '../hooks/useConnectionWorkflow';

type RelationshipChooserOverlayProps = {
  chooser: ChooserState;
  onSelect: (_choice: RelationshipChoice) => void;
  onClose: () => void;
  onRemove: () => void;
};

export const RelationshipChooserOverlay = ({
  chooser,
  onSelect,
  onClose,
  onRemove,
}: RelationshipChooserOverlayProps) => {
  if (!chooser) return null;

  return (
    <RelationshipChooser
      x={chooser.x}
      y={chooser.y}
      sourceLabel={chooser.sourceLabel}
      targetLabel={chooser.targetLabel}
      selectedKind={chooser.kind}
      onSelect={onSelect}
      onClose={onClose}
      onRemove={chooser.edgeId === 'pending' ? undefined : onRemove}
    />
  );
};
