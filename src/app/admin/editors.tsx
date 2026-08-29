"use client";

import React, { useRef, useState } from "react";
import type { SiteContent } from "@/lib/content";
import { humanize, parseYouTubeId, randomSuffix, slugify } from "./lib";

/**
 * The section editors: one per editable part of the site, sharing the same
 * small kit of fields and buttons. Each receives the working content, an
 * `update` that mutates a draft of it, and `stageImage`, which holds a
 * picked photo locally until the change is submitted.
 */

export type ImageFolder = "photos" | "groups" | "announcements" | "hero";

export type EditorProps = {
  content: SiteContent;
  update: (mutate: (draft: SiteContent) => void) => void;
  stageImage: (
    folder: ImageFolder,
    file: File,
  ) => Promise<{ url: string; width: number; height: number }>;
  /** Resolves staged images to their local previews. */
  imgSrc: (url: string) => string;
  onError: (message: string) => void;
};

/* ---------------------------------------------------------------
   Shared pieces
   --------------------------------------------------------------- */

export function Field({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[13px] font-medium text-neutral-500">{label}</span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[16px] text-neutral-900 outline-none focus:border-indigo-500"
      />
      {hint ? <span className="mt-1 block text-[12px] text-neutral-400">{hint}</span> : null}
    </label>
  );
}

export function Area({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[13px] font-medium text-neutral-500">{label}</span>
      <textarea
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className="w-full resize-y rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[16px] leading-relaxed text-neutral-900 outline-none focus:border-indigo-500"
      />
    </label>
  );
}

function RowTools({
  onUp,
  onDown,
  onRemove,
  removeLabel = "Remove",
}: {
  onUp?: () => void;
  onDown?: () => void;
  onRemove?: () => void;
  removeLabel?: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {onUp && (
        <button type="button" onClick={onUp} aria-label="Move earlier" className="rounded-lg border border-neutral-200 px-2.5 py-1.5 text-[13px] text-neutral-600 active:bg-neutral-100">
          ↑
        </button>
      )}
      {onDown && (
        <button type="button" onClick={onDown} aria-label="Move later" className="rounded-lg border border-neutral-200 px-2.5 py-1.5 text-[13px] text-neutral-600 active:bg-neutral-100">
          ↓
        </button>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={() => {
            if (window.confirm(`${removeLabel}? This only takes effect once your change is submitted and approved.`)) onRemove();
          }}
          className="rounded-lg border border-red-200 px-2.5 py-1.5 text-[13px] text-red-600 active:bg-red-50"
        >
          {removeLabel}
        </button>
      )}
    </div>
  );
}

export function PickButton({
  label,
  multiple,
  onFiles,
  primary,
}: {
  label: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  primary?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={
          primary
            ? "rounded-full bg-indigo-950 px-4 py-2 text-[14px] font-medium text-white active:opacity-80"
            : "rounded-full border border-neutral-300 bg-white px-4 py-2 text-[14px] font-medium text-neutral-800 active:bg-neutral-100"
        }
      >
        {label}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          event.target.value = "";
          if (files.length) onFiles(files);
        }}
      />
    </>
  );
}

function move<T>(list: T[], index: number, delta: number) {
  const target = index + delta;
  if (target < 0 || target >= list.length) return;
  const [item] = list.splice(index, 1);
  list.splice(target, 0, item);
}

/* ---------------------------------------------------------------
   Photo gallery
   --------------------------------------------------------------- */

export function PhotosEditor({ content, update, stageImage, imgSrc, onError }: EditorProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);

  const addPhotos = async (files: File[]) => {
    setAdding(true);
    try {
      for (const file of files) {
        const staged = await stageImage("photos", file);
        const title = humanize(file.name);
        update((draft) => {
          draft.photos.push({
            id: `${slugify(file.name)}-${randomSuffix()}`,
            src: staged.url,
            alt: title,
            title,
            caption: "",
          });
        });
      }
      setOpenIndex(null);
    } catch (error) {
      onError(error instanceof Error ? error.message : "That photo couldn't be added.");
    } finally {
      setAdding(false);
    }
  };

  const replacePhoto = async (index: number, file: File) => {
    try {
      const staged = await stageImage("photos", file);
      update((draft) => {
        draft.photos[index].src = staged.url;
      });
    } catch (error) {
      onError(error instanceof Error ? error.message : "That photo couldn't be read.");
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-[14px] leading-relaxed text-neutral-500">
        These are the photographs in the gallery on the Media page, in the order shown. Tap one to
        edit or replace it.
      </p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {content.photos.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className={`relative aspect-square overflow-hidden rounded-xl border-2 ${
              openIndex === index ? "border-indigo-600" : "border-transparent"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgSrc(photo.src)} alt={photo.alt} className="h-full w-full object-cover" />
          </button>
        ))}
      </div>

      {openIndex !== null && content.photos[openIndex] && (
        <div className="space-y-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[13px] font-semibold text-neutral-700">
              Photo {openIndex + 1} of {content.photos.length}
            </span>
            <RowTools
              onUp={openIndex > 0 ? () => { update((draft) => move(draft.photos, openIndex, -1)); setOpenIndex(openIndex - 1); } : undefined}
              onDown={openIndex < content.photos.length - 1 ? () => { update((draft) => move(draft.photos, openIndex, 1)); setOpenIndex(openIndex + 1); } : undefined}
              onRemove={() => {
                update((draft) => { draft.photos.splice(openIndex, 1); });
                setOpenIndex(null);
              }}
            />
          </div>
          <Field
            label="Title"
            value={content.photos[openIndex].title}
            onChange={(value) => update((draft) => { draft.photos[openIndex].title = value; })}
          />
          <Field
            label="Caption"
            value={content.photos[openIndex].caption}
            onChange={(value) =>
              update((draft) => {
                draft.photos[openIndex].caption = value;
                if (!draft.photos[openIndex].alt.trim()) draft.photos[openIndex].alt = value;
              })
            }
            hint="A line about the picture, shown when it is opened."
          />
          <PickButton label="Replace this photo" onFiles={(files) => replacePhoto(openIndex, files[0])} />
        </div>
      )}

      <PickButton
        label={adding ? "Adding…" : "Add photos"}
        primary
        multiple
        onFiles={addPhotos}
      />
    </div>
  );
}

/* ---------------------------------------------------------------
   Announcements
   --------------------------------------------------------------- */

export function AnnouncementsEditor({ content, update, stageImage, imgSrc, onError }: EditorProps) {
  const replaceFlyer = async (index: number, file: File) => {
    try {
      const staged = await stageImage("announcements", file);
      update((draft) => {
        draft.announcements[index].image = staged.url;
        draft.announcements[index].width = staged.width;
        draft.announcements[index].height = staged.height;
      });
    } catch (error) {
      onError(error instanceof Error ? error.message : "That flyer couldn't be read.");
    }
  };

  const addAnnouncement = async (file: File) => {
    try {
      const staged = await stageImage("announcements", file);
      update((draft) => {
        draft.announcements.push({
          id: `announcement-${randomSuffix()}`,
          label: "New announcement",
          image: staged.url,
          width: staged.width,
          height: staged.height,
          title: "",
          detail: "",
        });
      });
    } catch (error) {
      onError(error instanceof Error ? error.message : "That flyer couldn't be read.");
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-[14px] leading-relaxed text-neutral-500">
        The flyers the Events page turns through. Each one carries a short name for its button, a
        title, and a line or two underneath.
      </p>
      {content.announcements.map((item, index) => (
        <div key={item.id} className="space-y-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
          <div className="flex items-start justify-between gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgSrc(item.image)} alt={item.title || item.label} className="h-24 w-auto rounded-lg object-contain" />
            <RowTools
              onUp={index > 0 ? () => update((draft) => move(draft.announcements, index, -1)) : undefined}
              onDown={index < content.announcements.length - 1 ? () => update((draft) => move(draft.announcements, index, 1)) : undefined}
              onRemove={() => update((draft) => { draft.announcements.splice(index, 1); })}
            />
          </div>
          <Field label="Button name" value={item.label} onChange={(value) => update((draft) => { draft.announcements[index].label = value; })} hint="Short — it becomes the little button beside the flyer." />
          <Field label="Title" value={item.title} onChange={(value) => update((draft) => { draft.announcements[index].title = value; })} />
          <Area label="Details" value={item.detail} onChange={(value) => update((draft) => { draft.announcements[index].detail = value; })} />
          <PickButton label="Replace flyer image" onFiles={(files) => replaceFlyer(index, files[0])} />
        </div>
      ))}
      <PickButton label="Add an announcement (pick its flyer)" primary onFiles={(files) => addAnnouncement(files[0])} />
    </div>
  );
}

/* ---------------------------------------------------------------
   Events
   --------------------------------------------------------------- */

export function EventsEditor({ content, update }: EditorProps) {
  return (
    <div className="space-y-4">
      <p className="text-[14px] leading-relaxed text-neutral-500">
        The list on the Events page — the things happening once, with a date. Weekly services live
        under Service times instead.
      </p>
      {content.upcomingEvents.map((event, index) => (
        <div key={index} className="space-y-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
          <div className="flex items-center justify-end">
            <RowTools
              onUp={index > 0 ? () => update((draft) => move(draft.upcomingEvents, index, -1)) : undefined}
              onDown={index < content.upcomingEvents.length - 1 ? () => update((draft) => move(draft.upcomingEvents, index, 1)) : undefined}
              onRemove={() => update((draft) => { draft.upcomingEvents.splice(index, 1); })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date" value={event.date} onChange={(value) => update((draft) => { draft.upcomingEvents[index].date = value; })} placeholder="Sep 12" />
            <Field label="Time" value={event.time} onChange={(value) => update((draft) => { draft.upcomingEvents[index].time = value; })} placeholder="1:00pm" />
          </div>
          <Field label="Event name" value={event.title} onChange={(value) => update((draft) => { draft.upcomingEvents[index].title = value; })} />
          <Field label="Note (optional)" value={event.note ?? ""} onChange={(value) => update((draft) => { draft.upcomingEvents[index].note = value || undefined; })} hint="An extra line under the event, if it needs one." />
        </div>
      ))}
      <button
        type="button"
        onClick={() => update((draft) => { draft.upcomingEvents.push({ date: "", title: "", time: "" }); })}
        className="rounded-full bg-indigo-950 px-4 py-2 text-[14px] font-medium text-white active:opacity-80"
      >
        Add an event
      </button>
    </div>
  );
}

/* ---------------------------------------------------------------
   Service times
   --------------------------------------------------------------- */

export function ServiceTimesEditor({ content, update }: EditorProps) {
  return (
    <div className="space-y-4">
      <p className="text-[14px] leading-relaxed text-neutral-500">
        The weekly rhythm, shown on the home page. All times are Eastern.
      </p>
      {content.serviceTimes.map((service, index) => (
        <div key={index} className="space-y-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
          <div className="flex items-center justify-end">
            <RowTools
              onUp={index > 0 ? () => update((draft) => move(draft.serviceTimes, index, -1)) : undefined}
              onDown={index < content.serviceTimes.length - 1 ? () => update((draft) => move(draft.serviceTimes, index, 1)) : undefined}
              onRemove={() => update((draft) => { draft.serviceTimes.splice(index, 1); })}
            />
          </div>
          <Field label="Service" value={service.name} onChange={(value) => update((draft) => { draft.serviceTimes[index].name = value; })} />
          <Field label="When" value={service.when} onChange={(value) => update((draft) => { draft.serviceTimes[index].when = value; })} placeholder="Sundays, 10:00am" />
        </div>
      ))}
      <button
        type="button"
        onClick={() => update((draft) => { draft.serviceTimes.push({ name: "", when: "" }); })}
        className="rounded-full bg-indigo-950 px-4 py-2 text-[14px] font-medium text-white active:opacity-80"
      >
        Add a service
      </button>
    </div>
  );
}

/* ---------------------------------------------------------------
   Groups
   --------------------------------------------------------------- */

export function GroupsEditor({ content, update, stageImage, imgSrc, onError }: EditorProps) {
  const replacePhoto = async (index: number, file: File) => {
    try {
      const staged = await stageImage("groups", file);
      update((draft) => {
        draft.groups[index].image = staged.url;
      });
    } catch (error) {
      onError(error instanceof Error ? error.message : "That photo couldn't be read.");
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-[14px] leading-relaxed text-neutral-500">
        The Groups page: the pastor, the choir and the ministries, each with a photograph and a few
        sentences.
      </p>
      {content.groups.map((group, index) => (
        <div key={group.id} className="space-y-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
          <div className="flex items-start justify-between gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgSrc(group.image)} alt={group.alt} className="h-20 w-20 rounded-xl object-cover" />
            <RowTools
              onUp={index > 0 ? () => update((draft) => move(draft.groups, index, -1)) : undefined}
              onDown={index < content.groups.length - 1 ? () => update((draft) => move(draft.groups, index, 1)) : undefined}
            />
          </div>
          <Field label="Group" value={group.group} onChange={(value) => update((draft) => { draft.groups[index].group = value; })} />
          <Field label="Led by (optional)" value={group.name ?? ""} onChange={(value) => update((draft) => { draft.groups[index].name = value || undefined; })} />
          <Field label="Role shown under the name (optional)" value={group.role ?? ""} onChange={(value) => update((draft) => { draft.groups[index].role = value || undefined; })} />
          <Area label="About this group" value={group.description} onChange={(value) => update((draft) => { draft.groups[index].description = value; })} />
          <PickButton label="Replace photo" onFiles={(files) => replacePhoto(index, files[0])} />
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------
   Videos
   --------------------------------------------------------------- */

export function VideosEditor({ content, update }: EditorProps) {
  return (
    <div className="space-y-4">
      <p className="text-[14px] leading-relaxed text-neutral-500">
        The videos on the Media page. Paste a YouTube link and the site fetches its thumbnail by
        itself — nothing to upload.
      </p>
      {content.videos.map((video, index) => (
        <div key={`${video.id}-${index}`} className="space-y-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
          <div className="flex items-center justify-end">
            <RowTools
              onUp={index > 0 ? () => update((draft) => move(draft.videos, index, -1)) : undefined}
              onDown={index < content.videos.length - 1 ? () => update((draft) => move(draft.videos, index, 1)) : undefined}
              onRemove={() => update((draft) => { draft.videos.splice(index, 1); })}
            />
          </div>
          <Field
            label="YouTube link"
            value={video.id}
            onChange={(value) => update((draft) => { draft.videos[index].id = parseYouTubeId(value); })}
            hint="Paste the whole link — it is trimmed to what's needed."
          />
          <Field label="Title" value={video.title} onChange={(value) => update((draft) => { draft.videos[index].title = value; })} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Kind" value={video.kind} onChange={(value) => update((draft) => { draft.videos[index].kind = value; })} placeholder="Sermon, Praise, Ministration…" />
            <Field label="Credit (optional)" value={video.credit ?? ""} onChange={(value) => update((draft) => { draft.videos[index].credit = value || undefined; })} placeholder="Who is ministering or preaching" />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => update((draft) => { draft.videos.push({ id: "", kind: "Sermon", title: "" }); })}
        className="rounded-full bg-indigo-950 px-4 py-2 text-[14px] font-medium text-white active:opacity-80"
      >
        Add a video
      </button>
    </div>
  );
}

/* ---------------------------------------------------------------
   Home page backdrop
   --------------------------------------------------------------- */

export function HeroEditor({ content, update, stageImage, imgSrc, onError }: EditorProps) {
  const replace = async (file: File) => {
    try {
      const staged = await stageImage("hero", file);
      update((draft) => {
        draft.heroImage = staged.url;
      });
    } catch (error) {
      onError(error instanceof Error ? error.message : "That photo couldn't be read.");
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-[14px] leading-relaxed text-neutral-500">
        The photograph behind the big headline on the home page. It sits under a dark wash, so a
        wide photo with a clear subject works best. Change it thoughtfully — it is the first thing
        every visitor sees.
      </p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imgSrc(content.heroImage)} alt="Home page backdrop" className="w-full rounded-2xl object-cover" />
      <PickButton label="Replace backdrop photo" primary onFiles={(files) => replace(files[0])} />
    </div>
  );
}
