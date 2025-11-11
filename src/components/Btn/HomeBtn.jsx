
import { useNavigate } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import { Button } from "antd";

const HomeBtn = () => {
    const navigate = useNavigate();
    return (
        <div>
        <Button
            type="primary"
            icon={<FaHome />}
            onClick={() => navigate("/")} 
            block          
        >
          Trang chủ
        </Button>
        </div>
    );
    };

    export default HomeBtn;
