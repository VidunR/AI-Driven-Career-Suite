import React, { useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Calendar, MapPin, Building, ExternalLink, Heart, X } from 'lucide-react';

/**
 * Premium, centered job details modal.
 * Props:
 *  - open: boolean
 *  - job: selected job object or null
 *  - onClose: () => void
 *  - toggleSaveJob: (jobId) => void
 *  - getJobTypeColor: (type) => string
 *  - formatDate: (iso) => string
 */
export default function JobDetailsModal({
  open,
  job,
  onClose,
  toggleSaveJob,
  getJobTypeColor,
  formatDate
}) {
  // Lock background scroll + close on ESC
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open || !job) return null;

  // Helper to clean and render HTML content
  const renderDescription = (desc) => {
    if (!desc) return <p className="text-muted-foreground">No description available</p>;
    
    // Clean up the HTML: remove script tags, normalize whitespace
    let cleaned = String(desc)
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    return (
      <div 
        dangerouslySetInnerHTML={{ __html: cleaned }} 
        className="job-description-content"
      />
    );
  };

  return (
    <>
      <style>{`
        @keyframes modalFade { from {opacity: 0} to {opacity: 1} }
        @keyframes modalUp { from { opacity: 0; transform: translateY(14px) scale(.985) } to { opacity: 1; transform: translateY(0) scale(1)} }

        /* Backdrop */
        .jd-backdrop {
          animation: modalFade .25s ease-out forwards;
          background: radial-gradient(55% 55% at 50% 50%, rgba(10,10,14,0.55), rgba(10,10,14,0.8));
          backdrop-filter: blur(45px);
        }

        /* Centering shell with safe padding on all sides */
        .jd-center {
          padding: max(16px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) max(16px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left));
          display: grid;
          place-items: center;
        }

        /* Panel & premium border */
        .jd-panel-wrap { animation: modalUp .28s ease-out forwards; width: 100%; }
        .jd-panel {
          position: relative;
          overflow: hidden;
          border-radius: 20px;
          background: linear-gradient(180deg, rgba(255,255,255,0.065), rgba(255,255,255,0.035));
          backdrop-filter: blur(10px);
          box-shadow: 0 24px 70px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.06);
        }
        .jd-panel::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 22px;
          padding: 1px;
          background: linear-gradient(135deg, rgba(139,92,246,.7), rgba(34,211,238,.6), rgba(236,72,153,.6));
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
                  mask-composite: exclude;
          pointer-events: none;
        }

        .jd-close {
          transition: transform .18s ease-out, opacity .18s ease-out, background .18s ease-out;
        }
        .jd-close:hover { transform: scale(1.06) }

        /* Body scrolling with max height to ensure padding is visible all around */
        .jd-body {
          max-height: min(80vh, 900px);
          overflow-y: auto;
        }
        .jd-body::-webkit-scrollbar {
          width: 8px;
        }
        .jd-body::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.03);
          border-radius: 4px;
        }
        .jd-body::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.15);
          border-radius: 4px;
        }
        .jd-body::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.25);
        }

        /* Comprehensive styling for API HTML content */
        .job-description-content {
          color: hsl(var(--muted-foreground));
          line-height: 1.7;
          font-size: 0.95rem;
        }
        
        /* Reset margins for all elements */
        .job-description-content > *:first-child {
          margin-top: 0 !important;
        }
        .job-description-content > *:last-child {
          margin-bottom: 0 !important;
        }

        /* Paragraphs */
        .job-description-content p {
          margin: 0 0 1.2em 0;
          color: hsl(var(--muted-foreground));
        }

        /* Headings */
        .job-description-content h1,
        .job-description-content h2,
        .job-description-content h3,
        .job-description-content h4,
        .job-description-content h5,
        .job-description-content h6 {
          color: hsl(var(--foreground));
          font-weight: 600;
          margin: 1.5em 0 0.75em 0;
          line-height: 1.3;
        }
        .job-description-content h1 { font-size: 1.5em; }
        .job-description-content h2 { font-size: 1.35em; }
        .job-description-content h3 { font-size: 1.2em; }
        .job-description-content h4 { font-size: 1.1em; }
        
        /* Lists */
        .job-description-content ul,
        .job-description-content ol {
          margin: 1em 0;
          padding-left: 1.75em;
          color: hsl(var(--muted-foreground));
        }
        .job-description-content ul {
          list-style-type: disc;
        }
        .job-description-content ol {
          list-style-type: decimal;
        }
        .job-description-content li {
          margin-bottom: 0.6em;
          line-height: 1.6;
        }
        .job-description-content li::marker {
          color: hsl(var(--primary));
        }

        /* Nested lists */
        .job-description-content ul ul,
        .job-description-content ol ol,
        .job-description-content ul ol,
        .job-description-content ol ul {
          margin: 0.5em 0;
        }

        /* Strong/Bold */
        .job-description-content strong,
        .job-description-content b {
          color: hsl(var(--foreground));
          font-weight: 600;
        }

        /* Emphasis/Italic */
        .job-description-content em,
        .job-description-content i {
          font-style: italic;
        }

        /* Links */
        .job-description-content a {
          color: hsl(var(--primary));
          text-decoration: underline;
          transition: opacity 0.2s;
        }
        .job-description-content a:hover {
          opacity: 0.8;
        }

        /* Blockquotes */
        .job-description-content blockquote {
          border-left: 3px solid hsl(var(--primary));
          padding-left: 1.2em;
          margin: 1.2em 0;
          font-style: italic;
          color: hsl(var(--muted-foreground));
        }

        /* Code blocks */
        .job-description-content code {
          background: rgba(255,255,255,0.08);
          padding: 0.2em 0.4em;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
        }
        .job-description-content pre {
          background: rgba(255,255,255,0.05);
          padding: 1em;
          border-radius: 8px;
          overflow-x: auto;
          margin: 1.2em 0;
        }
        .job-description-content pre code {
          background: none;
          padding: 0;
        }

        /* Tables */
        .job-description-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.2em 0;
        }
        .job-description-content th,
        .job-description-content td {
          border: 1px solid rgba(255,255,255,0.1);
          padding: 0.6em;
          text-align: left;
        }
        .job-description-content th {
          background: rgba(255,255,255,0.05);
          font-weight: 600;
          color: hsl(var(--foreground));
        }

        /* Horizontal rules */
        .job-description-content hr {
          border: none;
          border-top: 1px solid rgba(255,255,255,0.1);
          margin: 1.5em 0;
        }

        /* Divs and spans inherit base styling */
        .job-description-content div,
        .job-description-content span {
          line-height: inherit;
        }

        /* Line breaks */
        .job-description-content br {
          content: "";
          display: block;
          margin: 0.5em 0;
        }
      `}</style>

      {/* Backdrop - clicking this closes modal */}
      <div className="fixed inset-0 z-50 jd-backdrop" onClick={onClose} />

      {/* Centered container */}
      <div className="fixed inset-0 z-50 jd-center overflow-auto">
        <div
          className="jd-panel-wrap max-w-4xl md:max-w-5xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="jd-panel">
            {/* Header */}
            <div className="px-6 py-5 md:px-8 md:py-6 border-b border-border/60 relative mt-2">
              {/* Close button (top-right) */}
              <button
                onClick={onClose}
                className="absolute top-1 right-4 md:top-5 md:right-6 p-2 rounded-full hover:bg-white/10 jd-close"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="flex items-start gap-6 pr-12">
                {/* Title / meta (left) */}
                <div className="min-w-0 flex-1 mt-2">
                  <h2 className="text-xl md:text-2xl font-bold leading-tight mt-2">
                    {job.title}
                  </h2>
                  <p className="text-base text-muted-foreground flex items-center gap-2 mt-2">
                    <Building className="h-5 w-5 shrink-0" />
                    <span className="truncate">{job.company}</span>
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-2 mb-2">
                    <span className="flex items-center gap-1 mb-3">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1 mb-3">
                      <Calendar className="h-4 w-4" />
                      Posted {formatDate(job.postedDate)}
                    </span>
                    <span className="flex items-center gap-1 mb-3">
                      {job.type && (
                        <Badge className={`capitalize ${getJobTypeColor(job.type)}`}>{job.type}</Badge>
                      )}
                    </span>
                  </div>
                </div>

                {/* Actions (right) */}
                <div className="flex gap-2 shrink-0 mt-8">
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSaveJob(job.id);
                    }}
                    className="mt-4"
                  >
                    <Heart className={`h-4 w-4 mr-2 ${job.saved ? 'fill-red-500 text-red-500' : ''}`} />
                    {job.saved ? 'Saved' : 'Save'}
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      job.url && window.open(job.url, '_blank', 'noopener,noreferrer');
                    }}
                    disabled={!job.url}
                    title={job.url ? 'Open original job posting' : 'No external URL available'}
                    className="mt-4"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Post
                  </Button>
                </div>
              </div>
            </div>

            {/* Body (scrolls inside, with equal inner padding) */}
            <div className="jd-body px-6 py-6 md:px-8 md:py-7 space-y-6">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">Job Description</h3>
                {renderDescription(job.description)}
              </div>

              {job.requirements?.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Requirements</h3>
                    <ul className="space-y-2">
                      {job.requirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span className="text-muted-foreground">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

              {job.skills?.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Required Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {job.benefits?.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Benefits</h3>
                    <ul className="space-y-2">
                      {job.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-accent mt-1">✓</span>
                          <span className="text-muted-foreground">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}