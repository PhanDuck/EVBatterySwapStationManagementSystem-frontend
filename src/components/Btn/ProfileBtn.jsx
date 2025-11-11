import { useNavigate } from "react-router-dom";
import { Button } from "antd";
import { FaUserCircle } from "react-icons/fa";

const ProfileBtn = () => {
  const Role = JSON.parse(localStorage.getItem("currentUser"))?.role || "User";
  const navigate = useNavigate();
  return (
    <div>
      <Button
        type="primary"
        icon={<FaUserCircle />}
        onClick={() => navigate(`/${Role.toLowerCase()}/Profile`)}
        block
      >
        Trang cá nhân
      </Button>
    </div>
  );
};

export default ProfileBtn;
