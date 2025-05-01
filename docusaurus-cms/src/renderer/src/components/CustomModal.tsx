import { Paper, Group, Title, CloseButton } from '@mantine/core';
import './CustomModal.css';

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

function CustomModal({ isOpen, onClose, title, children }: CustomModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <Paper p="md" shadow="md" withBorder>
          <Group mb="md">
            <Title order={4}>{title}</Title>
            <CloseButton onClick={onClose} />
          </Group>
          {children}
        </Paper>
      </div>
    </div>
  );
}

export default CustomModal;
