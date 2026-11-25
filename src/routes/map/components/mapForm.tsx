"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  MapPreview,
  ShadButton,
  Switch,
  TexturePackPicker,
} from "@/components/index";
import { DEFAULT_TEXTURE_PACK_ID } from "@/utils/texturePacks";
import { MapData } from "@/utils/types";

const FormSchema = z.object({
  isPortalsEnabled: z.boolean(),
  isDelaySpoilEnabled: z.boolean(),
  texturePack: z.string(),
});

type Props = {
  mapName: string;
  title: string;
  onSelect: (data: MapData) => void;
};

export default function MapForm({ mapName, title, onSelect }: Props) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      isPortalsEnabled: false,
      isDelaySpoilEnabled: false,
      texturePack: DEFAULT_TEXTURE_PACK_ID,
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const mapData = {
      isPortalsEnabled: data.isPortalsEnabled,
      isDelaySpoilEnabled: data.isDelaySpoilEnabled,
      texturePack: data.texturePack,
      mapName,
    };
    onSelect(mapData);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        <FormField
          control={form.control}
          name="texturePack"
          render={({ field }) => (
            <FormItem className="space-y-3 rounded-lg border p-3 shadow-xs">
              <div>
                <FormLabel>Texture pack</FormLabel>
                <FormDescription className="mt-0.5">
                  How the map, bombs, blasts and spoils look for every player in
                  this room.
                </FormDescription>
              </div>
              {/* Redraws with the pack the host picks below */}
              <MapPreview
                mapName={mapName}
                title={title}
                packId={field.value}
                className="mx-auto h-auto w-full max-w-2xl rounded-md"
              />
              <TexturePackPicker
                value={field.value}
                onChange={field.onChange}
              />
            </FormItem>
          )}
        />
        <div>
          <h3 className="mb-4 text-lg font-medium">Additional features</h3>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="isPortalsEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-lg border p-3 shadow-xs">
                  <div>
                    <FormLabel>Enable portals</FormLabel>
                    <FormDescription className="mt-0.5">
                      Adds portals to the corners of the map, allowing you to
                      teleport and escape from the traps.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isDelaySpoilEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-lg border p-3 shadow-xs">
                  <div>
                    <FormLabel>Enable bomb delay spoil</FormLabel>
                    <FormDescription className="mt-0.5">
                      Adds to the spoils pool - delay to the bomb detonation,
                      making your bombs more dangerous. Lets you become true
                      "kamikaze"
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <ShadButton type="submit">Play</ShadButton>
        </div>
      </form>
    </Form>
  );
}
