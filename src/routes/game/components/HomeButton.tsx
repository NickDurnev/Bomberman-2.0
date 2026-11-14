import { Button } from "@components/index";
import { IoHomeOutline } from "react-icons/io5";

type Props = {
    onClick: () => void;
};

const HomeButton = ({ onClick }: Props) => (
    <Button
        icon={<IoHomeOutline size={17} />}
        onClick={onClick}
        className="rounded-full p-2"
    />
);

export default HomeButton;
