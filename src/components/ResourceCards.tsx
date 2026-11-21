import { Link } from 'react-router-dom';
import { ArrowUpRight, ExternalLink, Github, MapPin, Calendar } from 'lucide-react';
import { MediaFrame } from './MediaFrame';
import type {
  Competition,
  HardwareListing,
  LearningResource,
  StudentProject,
} from '../types';

export function LearningCard({ item }: { item: LearningResource }) {
  return (
    <article className="flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden hover:border-slate-300 transition-colors duration-150">
      <MediaFrame src={item.image_url} alt={item.title} aspectClass="aspect-[4/3]" />
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-slate-500">
          <span className="text-blue-700 font-semibold">{item.category}</span>
          <span aria-hidden="true">·</span>
          <span>{item.difficulty}</span>
          <span aria-hidden="true">·</span>
          <span className={item.is_free ? 'text-emerald-700 font-semibold' : 'text-slate-700'}>
            {item.price_label}
          </span>
          {item.is_demo === 1 && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-slate-400">Demo</span>
            </>
          )}
        </div>

        <h3 className="font-display text-lg font-semibold text-slate-900 mt-2.5 leading-snug">
          {item.title}
        </h3>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed line-clamp-3 flex-1">
          {item.description}
        </p>

        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500 tabular-nums truncate">
            {item.provider} · {item.duration}
          </span>
          <a
            href={item.resource_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-800 whitespace-nowrap shrink-0"
          >
            <span>Explore</span>
            <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </article>
  );
}

export function ProjectCard({ item }: { item: StudentProject }) {
  return (
    <article className="flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden hover:border-slate-300 transition-colors duration-150">
      <MediaFrame src={item.image_url} alt={item.title} aspectClass="aspect-[4/3]" />
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-slate-500">
          <span className="text-blue-700 font-semibold">{item.category}</span>
          <span aria-hidden="true">·</span>
          <span>{item.author_name}</span>
          {item.is_demo === 1 && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-slate-400">Demo</span>
            </>
          )}
        </div>

        <h3 className="font-display text-lg font-semibold text-slate-900 mt-2.5 leading-snug">
          {item.title}
        </h3>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed line-clamp-3 flex-1">
          {item.description}
        </p>

        <p className="mt-4 font-mono text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 truncate">
          {item.tech_stack}
        </p>

        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-4 text-xs font-semibold">
          {item.github_url ? (
            <a
              href={item.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-slate-700 hover:text-slate-950 whitespace-nowrap"
            >
              <Github className="w-4 h-4" aria-hidden="true" />
              <span>GitHub</span>
            </a>
          ) : (
            <span className="text-slate-400">Private Repo</span>
          )}
          {item.demo_url && (
            <a
              href={item.demo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-800 whitespace-nowrap"
            >
              <span>Live Demo</span>
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export function HardwareCard({
  item,
  onContactSeller,
}: {
  item: HardwareListing;
  onContactSeller: (listing: HardwareListing) => void;
}) {
  return (
    <article className="flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden hover:border-slate-300 transition-colors duration-150">
      <Link to={`/hardware/${item.id}`} className="block">
        <MediaFrame src={item.image_url} alt={item.title} aspectClass="aspect-[4/3]" />
      </Link>
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-slate-500">
          <span className="text-orange-600 font-semibold">{item.listing_type}</span>
          <span aria-hidden="true">·</span>
          <span>{item.category}</span>
          <span aria-hidden="true">·</span>
          <span>{item.condition}</span>
          {item.is_demo === 1 && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-slate-400">Demo</span>
            </>
          )}
        </div>

        <Link to={`/hardware/${item.id}`} className="group">
          <h3 className="font-display text-lg font-semibold text-slate-900 group-hover:text-blue-700 mt-2.5 leading-snug transition-colors">
            {item.title}
          </h3>
        </Link>

        <p className="font-mono text-sm font-semibold text-slate-900 mt-2 tabular-nums">
          {item.price_label}
        </p>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
          <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" aria-hidden="true" />
          <span className="truncate">{item.location}</span>
        </div>

        <p className="text-sm text-slate-600 mt-2.5 leading-relaxed line-clamp-2 flex-1">
          {item.description}
        </p>

        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <Link
            to={`/hardware/${item.id}`}
            className="text-xs font-semibold text-slate-700 hover:text-slate-950 whitespace-nowrap"
          >
            View Details
          </Link>
          <button
            type="button"
            onClick={() => onContactSeller(item)}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-orange-600 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            Contact Seller
          </button>
        </div>
      </div>
    </article>
  );
}

export function CompetitionCard({ item }: { item: Competition }) {
  return (
    <article className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 hover:border-slate-300 transition-colors duration-150">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-slate-500">
        <span className="text-blue-700 font-semibold">{item.type}</span>
        <span aria-hidden="true">·</span>
        <span>{item.location}</span>
        {item.is_demo === 1 && (
          <>
            <span aria-hidden="true">·</span>
            <span className="text-slate-400">Demo</span>
          </>
        )}
      </div>

      <h3 className="font-display text-lg font-semibold text-slate-900 mt-2.5 leading-snug">
        {item.title}
      </h3>
      <p className="text-xs font-medium text-slate-500 mt-1">{item.organizer}</p>

      <p className="text-sm text-slate-600 mt-3 leading-relaxed flex-1">{item.description}</p>

      <dl className="mt-5 pt-4 border-t border-slate-100 space-y-2 text-xs">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-500 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            <span>Deadline</span>
          </dt>
          <dd className="font-mono font-medium text-slate-900 tabular-nums">{item.deadline}</dd>
        </div>
        <div className="flex items-start justify-between gap-3">
          <dt className="text-slate-500 shrink-0">Eligibility</dt>
          <dd className="text-slate-700 text-right">{item.eligibility}</dd>
        </div>
      </dl>

      <div className="mt-5">
        <a
          href={item.registration_url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <span>Official Registration</span>
          <ExternalLink className="w-4 h-4" aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}
