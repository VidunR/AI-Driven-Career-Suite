import React from "react";
import { Card, CardContent } from "./UI/card";
import { Badge } from "./UI/badge";
import { Mail, Phone, MapPin, Linkedin, Globe, Calendar } from "lucide-react";

/**
 * @param {{ cvData: any, onClose: Function, theme: {colors: Record<string,string>} }} props
 */
export function CVPreview({ cvData, onClose, theme }) {
  const { personalInfo, experience, education, skills, achievements, projects } = cvData;
  const C = theme?.colors || {};

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose?.();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-3xl flex items-start justify-center z-50 p-4 overflow-y-auto"
      style={{ backdropFilter: "blur(5px)" }}
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-lg w-full max-w-4xl my-8 min-h-[80vh] shadow-2xl"
        style={{ background: C.paper, color: C.text }}
      >
        

        {/* CV Content */}
        <div className="mt-2 p-8">
          {/* Personal Information Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: C.text }}>
              {personalInfo.firstName} {personalInfo.lastName}
            </h1>

            <div className="flex flex-wrap justify-center gap-4 text-sm mb-4" style={{ color: C.subtleText }}>
              {personalInfo.email && (
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {personalInfo.email}
                </div>
              )}
              {personalInfo.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {personalInfo.phone}
                </div>
              )}
              {personalInfo.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {personalInfo.location}
                </div>
              )}
            </div>

            <div className="flex flex-wrap justify-center gap-4 text-sm" style={{ color: C.subtleText }}>
              {personalInfo.linkedin && (
                <div className="flex items-center gap-1">
                  <Linkedin className="w-4 h-4" />
                  {personalInfo.linkedin}
                </div>
              )}
              {personalInfo.website && (
                <div className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  {personalInfo.website}
                </div>
              )}
            </div>
          </div>

          {/* Professional Summary */}
          {personalInfo.summary && (
            <div className="mt-2 mb-8">
              <h2
                className="text-xl font-semibold mb-3 border-b pb-1"
                style={{ color: C.text, borderColor: C.divider }}
              >
                Professional Summary
              </h2>
              <p className="leading-relaxed" style={{ color: C.text }}>
                {personalInfo.summary}
              </p>
            </div>
          )}

          {/* Work Experience */}
          {experience && experience.length > 0 && experience[0].jobTitle && (
            <div className="mt-4 mb-8">
              <h2
                className="text-xl font-semibold mb-4 border-b pb-1"
                style={{ color: C.text, borderColor: C.divider }}
              >
                Work Experience
              </h2>
              <div className="space-y-6">
                {experience.map((exp, index) =>
                  exp.jobTitle ? (
                    <div key={index} className="pl-4" style={{ borderLeft: `3px solid ${C.primary}` }}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold" style={{ color: C.text }}>
                            {exp.jobTitle}
                          </h3>
                          <p className="font-medium" style={{ color: C.primary }}>
                            {exp.company}
                          </p>
                          {exp.location && (
                            <p className="text-sm" style={{ color: C.subtleText }}>
                              {exp.location}
                            </p>
                          )}
                        </div>
                        <div className="text-sm flex items-center gap-1" style={{ color: C.subtleText }}>
                          <Calendar className="w-4 h-4" />
                          {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                        </div>
                      </div>
                      {exp.description && (
                        <p className="text-sm leading-relaxed" style={{ color: C.text }}>
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ) : null
                )}
              </div>
            </div>
          )}

          {/* Education */}
          {education && education.length > 0 && education[0].degree && (
            <div className="mt-4 mb-8">
              <h2
                className="text-xl font-semibold mb-4 border-b pb-1"
                style={{ color: C.text, borderColor: C.divider }}
              >
                Education
              </h2>
              <div className="space-y-4">
                {education.map((edu, index) =>
                  edu.degree ? (
                    <div key={index} className="pl-4" style={{ borderLeft: `3px solid ${C.success}` }}>
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <h3 className="font-semibold" style={{ color: C.text }}>
                            {edu.degree}
                          </h3>
                          <p className="font-medium" style={{ color: C.success }}>
                            {edu.institution}
                          </p>
                          {edu.location && (
                            <p className="text-sm" style={{ color: C.subtleText }}>
                              {edu.location}
                            </p>
                          )}
                          {edu.gpa && (
                            <p className="text-sm" style={{ color: C.subtleText }}>
                              GPA: {edu.gpa}
                            </p>
                          )}
                        </div>
                        <div className="text-sm flex items-center gap-1" style={{ color: C.subtleText }}>
                          <Calendar className="w-4 h-4" />
                          {edu.startDate} - {edu.endDate}
                        </div>
                      </div>
                      {edu.description && (
                        <p className="text-sm leading-relaxed" style={{ color: C.text }}>
                          {edu.description}
                        </p>
                      )}
                    </div>
                  ) : null
                )}
              </div>
            </div>
          )}

          {/* Skills */}
          {skills && skills.length > 0 && (
            <div className="mt-4 mb-8">
              <h2
                className="text-xl font-semibold mb-4 border-b pb-1"
                style={{ color: C.text, borderColor: C.divider }}
              >
                Technical Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="px-3 py-1"
                    style={{
                      background: C.chipBg,
                      borderColor: C.chipBorder,
                      color: C.text,
                    }}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {projects && projects.length > 0 && projects[0].name && (
            <div className="mt-4 mb-8">
              <h2
                className="text-xl font-semibold mb-4 border-b pb-1"
                style={{ color: C.text, borderColor: C.divider }}
              >
                Projects
              </h2>
              <div className="space-y-3">
                {projects.map((project, index) =>
                  project.name ? (
                    <div key={index} className="pl-4" style={{ borderLeft: `3px solid ${C.project}` }}>
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold" style={{ color: C.text }}>
                          {project.name}
                        </h3>
                        {project.link && (
                          <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm hover:underline"
                            style={{ color: C.primary }}
                          >
                            View Project
                          </a>
                        )}
                      </div>
                      {project.description && (
                        <p className="text-sm leading-relaxed mt-1" style={{ color: C.text }}>
                          {project.description}
                        </p>
                      )}
                    </div>
                  ) : null
                )}
              </div>
            </div>
          )}

          {/* Achievements */}
          {achievements && achievements.length > 0 && achievements[0].title && (
            <div className="mt-4 mb-8">
              <h2
                className="text-xl font-semibold mb-4 border-b pb-1"
                style={{ color: C.text, borderColor: C.divider }}
              >
                Key Achievements
              </h2>
              <div className="space-y-3">
                {achievements.map((achievement, index) =>
                  achievement.title ? (
                    <div key={index} className="pl-4" style={{ borderLeft: `3px solid ${C.accent}` }}>
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-semibold" style={{ color: C.text }}>
                          {achievement.title}
                        </h3>
                        {achievement.date && (
                          <span className="text-sm" style={{ color: C.subtleText }}>
                            {achievement.date}
                          </span>
                        )}
                      </div>
                      {achievement.description && (
                        <p className="text-sm leading-relaxed" style={{ color: C.text }}>
                          {achievement.description}
                        </p>
                      )}
                    </div>
                  ) : null
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
