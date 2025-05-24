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
    ShadButton,
    Switch,
} from "@components/index";
import { MapData } from "@utils/types";

const FormSchema = z.object({
    isPortalsEnabled: z.boolean().default(false).optional(),
    isDelaySpoilEnabled: z.boolean().default(false).optional(),
});

type Props = {
    mapName: string;
    onSelect: (data: MapData) => void;
};

export default function MapForm({ mapName, onSelect }: Props) {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            isPortalsEnabled: false,
            isDelaySpoilEnabled: false,
        },
    });

    function onSubmit(data: z.infer<typeof FormSchema>) {
        const mapData = {
            isPortalsEnabled: data.isPortalsEnabled || false,
            isDelaySpoilEnabled: data.isDelaySpoilEnabled || false,
            mapName,
        };
        onSelect(mapData);
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full space-y-6"
            >
                <div>
                    <h3 className="mb-4 font-medium text-lg">
                        Additional features
                    </h3>
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="isPortalsEnabled"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel>Enable portals</FormLabel>
                                        <FormDescription>
                                            Adds portals to the corners of the
                                            map, allowing you to teleport and
                                            escape from the traps.
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
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel>
                                            Enable bomb delay spoil
                                        </FormLabel>
                                        <FormDescription>
                                            Adds to the spoils pool - delay to
                                            the bomb detonation, making your
                                            bombs more dangerous. Lets you
                                            become true "kamikaze"
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

