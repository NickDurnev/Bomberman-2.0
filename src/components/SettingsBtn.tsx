import { IoSettingsSharp } from "react-icons/io5";
import {
  Button,
  Label,
  Modal,
  ModalBody,
  ModalContent,
  ModalProvider,
  Switch,
  useModal,
} from "@/components/index";
import {
  type PlayerSettings,
  setSetting,
  usePlayerSettings,
} from "@/utils/settings";

const ROWS: {
  key: keyof PlayerSettings;
  label: string;
  description: string;
}[] = [
  {
    key: "screenShake",
    label: "Explosion shake and flash",
    description: "Small camera shake and flash when a bomb explodes near you.",
  },
  {
    key: "fuseWarning",
    label: "Bomb fuse warning",
    description: "A bomb flashes shortly before it explodes.",
  },
  {
    key: "particles",
    label: "Debris and pickup particles",
    description: "Sparks and debris when a box breaks or you pick up a spoil.",
  },
  {
    key: "glow",
    label: "Glow on spoils and portals",
    description: "A soft glow around spoils and portals.",
  },
];

const SettingsDialog = () => {
  const { open, setOpen } = useModal();
  const settings = usePlayerSettings();

  return (
    <>
      <Button
        ariaLabel="Settings"
        icon={<IoSettingsSharp size={30} color="#e2e1e1" />}
        onClick={() => setOpen(true)}
        className="rounded-full p-2"
      />
      <Modal>
        <ModalBody>
          <ModalContent>
            {open && (
              <div className="flex flex-col gap-y-4">
                <h3 className="text-center text-3xl font-bold tracking-wider">
                  Settings
                </h3>
                {ROWS.map(({ key, label, description }) => (
                  <div
                    key={key}
                    className="flex flex-row items-center justify-between gap-x-4 rounded-lg border p-3 shadow-xs"
                  >
                    <div>
                      <Label htmlFor={`setting-${key}`}>{label}</Label>
                      <p className="text-muted-foreground mt-0.5 text-sm">
                        {description}
                      </p>
                    </div>
                    <Switch
                      id={`setting-${key}`}
                      checked={settings[key]}
                      onCheckedChange={value => setSetting(key, value)}
                    />
                  </div>
                ))}
              </div>
            )}
          </ModalContent>
        </ModalBody>
      </Modal>
    </>
  );
};

export const SettingsBtn = () => (
  <ModalProvider>
    <SettingsDialog />
  </ModalProvider>
);
