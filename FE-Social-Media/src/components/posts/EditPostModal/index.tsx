import { Modal, Form, Input } from "antd";
import { Post, UpdatePostDto } from "../../../@util/types/post.type";

interface EditPostModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: UpdatePostDto) => Promise<void>;
  isDarkMode: boolean;
}

const EditPostModal = ({
  post,
  isOpen,
  onClose,
  onSubmit,
  isDarkMode,
}: EditPostModalProps) => {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (post) {
        await onSubmit(post.id, values);
        onClose();
      }
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  return (
    <Modal
      title="Edit Post"
      open={isOpen}
      onOk={handleSubmit}
      onCancel={onClose}
      okText="Save"
      cancelText="Cancel"
    >
      <Form form={form} initialValues={post || {}} layout="vertical">
        <Form.Item
          name="content"
          rules={[
            { required: true, message: "Please input your post content!" },
          ]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditPostModal;
