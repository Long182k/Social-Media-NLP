// CreateGroupModal.tsx
import { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

interface CreateGroupModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (formData: FormData) => void;
}

export const CreateGroupModal = ({
  show,
  onHide,
  onSubmit,
}: CreateGroupModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    if (file) {
      formData.append("file", file);
    }
    onSubmit(formData);
    onHide();
    setName("");
    setDescription("");
    setFile(null);
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Create New Group</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Group Name</Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Group Avatar</Form.Label>
            <Form.Control
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept="image/*"
            />
          </Form.Group>
          <Button variant="primary" type="submit">
            Create Group
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};
