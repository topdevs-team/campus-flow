import fs from 'node:fs/promises'
import path from 'node:path'
import { escapeLatex, latexParagraph } from '@/lib/latex-escape'
import { ResumeDraft, TemplateId } from '@/types/resume'

const templatePathById: Record<TemplateId, string> = {
  classic: 'classic/classic.tex',
  modern: 'modern/modern.tex',
  compact: 'compact/main.tex',
}

function optionalSection(title: string, body: string): string {
  if (!body.trim()) return ''
  return `\\section*{${title}}\n${body}\n`
}

function renderEducation(data: ResumeDraft): string {
  return data.education
    .map((edu) => {
      const primary = `\\textbf{${escapeLatex(edu.degree)}}${edu.field ? ` in ${escapeLatex(edu.field)}` : ''}`
      const secondary = [edu.school, edu.graduationDate].filter(Boolean).map(escapeLatex).join(' \\textbar\\ ')
      return `${primary}\\\\\n${secondary}`
    })
    .join('\n\\vspace{6pt}\n')
}

function renderExperience(data: ResumeDraft): string {
  return data.experience
    .map((exp) => {
      const titleLine = [exp.position, exp.company].filter(Boolean).map(escapeLatex).join(' at ')
      const dateLine = [exp.startDate, exp.endDate].filter(Boolean).map(escapeLatex).join(' -- ')
      const description = latexParagraph(exp.description)
      return `\\textbf{${titleLine}}\\\\\n${dateLine}${description ? `\\\\\n${description}` : ''}`
    })
    .join('\n\\vspace{6pt}\n')
}

function renderProjects(data: ResumeDraft): string {
  return data.projects
    .map((project) => {
      const header = [project.name, project.role].filter(Boolean).map(escapeLatex).join(' - ')
      const tech = project.technologies ? `\\textit{${escapeLatex(project.technologies)}}` : ''
      const description = latexParagraph(project.description)
      const link = project.link ? `\\\\\n${escapeLatex(project.link)}` : ''
      return `\\textbf{${header}}${tech ? `\\\\\n${tech}` : ''}${description ? `\\\\\n${description}` : ''}${link}`
    })
    .join('\n\\vspace{6pt}\n')
}

function sanitizeLatexFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '')
}

function linesFromText(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
}

function renderModernResume(data: ResumeDraft): string {
  const modernImageFilename = sanitizeLatexFilename(data.profile_image_filename || 'oval-transparent.png') || 'oval-transparent.png'
  const fullName = escapeLatex(data.full_name || 'Your Name')
  const summary = data.summary.trim() ? escapeLatex(data.summary.trim()) : 'Student resume profile'
  const skillItems = data.skills.length ? data.skills : ['Skill 1', 'Skill 2']

  const contactLines = [
    data.email ? `\\MVAt\\ ${escapeLatex(data.email)}` : '',
    data.phone ? `\\Mobilefone\\ ${escapeLatex(data.phone)}` : '',
    data.location ? `\\Letter\\ ${escapeLatex(data.location)}` : '',
  ].filter(Boolean)

  const leftEducation = data.education.length
    ? data.education
        .map((edu) => {
          const degree = [edu.degree, edu.field].filter(Boolean).map(escapeLatex).join(' in ')
          const school = escapeLatex(edu.school)
          const date = edu.graduationDate ? ` \\\\ ${escapeLatex(edu.graduationDate)}` : ''
          return `${degree || 'Education'} \\\\ ${school}${date}`
        })
        .join(' \\\\[0.8ex]\n')
    : 'No education added yet'

  const rightExperience = data.experience.length
    ? data.experience
        .map((exp) => {
          const role = escapeLatex(exp.position || 'Role')
          const company = escapeLatex(exp.company || 'Organization')
          const dates = [exp.startDate, exp.endDate].filter(Boolean).map(escapeLatex).join('--')
          const descriptionLines = linesFromText(exp.description).map((line) => `\\smaller{${escapeLatex(line)}}`).join('\n')
          return `\\textsc{${role}} at \\textit{${company}.} ${dates ? `\\dates{${dates}}` : ''} \\\\\n${descriptionLines || '\\smaller{}'}`
        })
        .join('\n\\is\n')
    : '\\textsc{No experience added yet.}'

  const rightProjects = data.projects.length
    ? data.projects
        .map((project) => {
          const title = escapeLatex(project.name || 'Project')
          const role = project.role ? ` (${escapeLatex(project.role)})` : ''
          const link = project.link ? ` ${escapeLatex(project.link)}` : ''
          const details = [project.technologies, project.description].filter(Boolean).map(escapeLatex).join(' - ')
          return `\\textsc{${title}${role}}${link ? ` \\dates{${link}}` : ''} \\\\\n\\smaller{${details || 'Project details'}}`
        })
        .join('\n\\is\n')
    : '\\textsc{No projects added yet.}'

  const rightEducation = data.education.length
    ? data.education
        .map((edu) => {
          const degree = [edu.degree, edu.field].filter(Boolean).map(escapeLatex).join(' in ')
          const school = escapeLatex(edu.school)
          const date = edu.graduationDate ? `\\dates{${escapeLatex(edu.graduationDate)}}` : ''
          return `\\textsc{${degree || 'Education'}} ${school}. ${date}`
        })
        .join('\n\\is\n')
    : '\\textsc{No education added yet.}'

  const contactBlock = contactLines.length ? contactLines.join(' \\\\[0.5ex]\n') : '\\Letter\\ Add contact details'
  const skillsBlock = skillItems.map((skill) => `\\item ${escapeLatex(skill)}`).join('\n')

  return `\\documentclass[11pt, a4paper]{article}
\\usepackage[T1]{fontenc}
\\usepackage[utf8]{inputenc}
\\usepackage[british]{babel}
\\usepackage[left = 0mm, right = 0mm, top = 0mm, bottom = 0mm]{geometry}
\\usepackage[stretch = 25, shrink = 25, tracking=true, letterspace=30]{microtype}
\\usepackage{graphicx}
\\usepackage{xcolor}
\\usepackage{tikz}
\\IfFileExists{marvosym.sty}{\\usepackage{marvosym}}{
  \\newcommand{\\MVAt}{@}
  \\newcommand{\\Mobilefone}{Tel}
  \\newcommand{\\Mundus}{Web}
  \\newcommand{\\Letter}{Addr}
}
\\usepackage{enumitem}
\\setlist{parsep = 0pt, topsep = 0pt, partopsep = 1pt, itemsep = 1pt, leftmargin = 6mm}
\\IfFileExists{FiraSans.sty}{\\usepackage{FiraSans}\\renewcommand{\\familydefault}{\\sfdefault}}{\\usepackage{lmodern}}
\\definecolor{cvblue}{HTML}{304263}
\\newcommand{\\dates}[1]{\\hfill\\mbox{\\textbf{#1}}}
\\newcommand{\\is}{\\par\\vskip.5ex plus .4ex}
\\newcommand{\\smaller}[1]{{\\small$\\diamond$\\ #1}}
\\newcommand{\\headleft}[1]{\\vspace*{3ex}\\textsc{\\textbf{#1}}\\par\\vspace*{-1.5ex}\\hrulefill\\par\\vspace*{0.7ex}}
\\newcommand{\\headright}[1]{\\vspace*{2.5ex}\\textsc{\\Large\\color{cvblue}#1}\\par\\vspace*{-2ex}{\\color{cvblue}\\hrulefill}\\par}
\\usepackage[colorlinks = true, urlcolor = white, linkcolor = white]{hyperref}

\\begin{document}
\\setlength{\\topskip}{0pt}
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{0pt}
\\setlength{\\fboxsep}{0pt}
\\pagestyle{empty}
\\raggedbottom

\\begin{minipage}[t]{0.33\\textwidth}
\\colorbox{cvblue}{\\begin{minipage}[t][5mm][t]{\\textwidth}\\null\\hfill\\null\\end{minipage}}

\\vspace{-.2ex}
\\colorbox{cvblue!90}{\\color{white}
\\kern0.09\\textwidth\\relax
\\begin{minipage}[t][293mm][t]{0.82\\textwidth}
\\raggedright
\\vspace*{2.5ex}

\\Large ${fullName} \\normalsize

\\null\\hfill\\begin{tikzpicture}
\\clip (0,0) circle (1.75cm);
\\node at (0,0) {\\includegraphics[width=3.5cm,height=3.5cm]{${modernImageFilename}}};
\\end{tikzpicture}\\hfill\\null

\\vspace*{0.5ex}
\\headleft{Profile}
${summary}

\\headleft{Contact details}
\\small
${contactBlock}
\\normalsize

\\headleft{Education}
\\small
${leftEducation}
\\normalsize

\\headleft{Skills}
\\begin{itemize}
${skillsBlock}
\\end{itemize}

\\end{minipage}%
\\kern0.09\\textwidth\\relax
}
\\end{minipage}
\\hskip2.5em
\\begin{minipage}[t]{0.56\\textwidth}
\\setlength{\\parskip}{0.8ex}
\\vspace{2ex}

\\headright{Experience}
${rightExperience}

\\headright{Projects}
${rightProjects}

\\headright{Education}
${rightEducation}
\\end{minipage}

\\end{document}`
}

function splitName(fullName: string): { first: string; last: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return { first: 'First', last: 'Name' }
  if (parts.length === 1) return { first: parts[0], last: '' }
  return { first: parts[0], last: parts.slice(1).join(' ') }
}

function renderCompactResume(data: ResumeDraft): string {
  const { first, last } = splitName(data.full_name)
  const titleLine = [data.email, data.phone, data.location].filter(Boolean).map(escapeLatex).join(' | ') || 'email | phone | address'
  const summary = escapeLatex(data.summary.trim() || 'Add a short profile summary.')

  const educationLeft = data.education.length
    ? data.education
        .map((edu) => {
          const degree = [edu.degree, edu.field].filter(Boolean).map(escapeLatex).join(' in ') || 'Degree'
          const school = escapeLatex(edu.school || 'Institution')
          const date = escapeLatex(edu.graduationDate || '')
          return `\\textbf{${degree}} \\\\
${school} \\\\
\\textcolor{black!70}{${date}} \\\\
\\vspace{2mm}`
        })
        .join('\n')
    : '\\textbf{Education details not added yet.}'

  const skillsItems = (data.skills.length ? data.skills : ['Skill']).map((skill) => `\\item ${escapeLatex(skill)}`).join('\n')

  const linksBlock = (() => {
    const projectLink = data.projects.find((p) => p.link?.trim())?.link?.trim()
    const lines = [
      data.email ? `\\faIcon{envelope}\\hspace{2mm}${escapeLatex(data.email)}` : '',
      projectLink ? `\\faIcon{link}\\hspace{2mm}\\href{${escapeLatex(projectLink)}}{${escapeLatex(projectLink)}}` : '',
    ].filter(Boolean)
    return lines.length ? lines.join(' \\\\\n') : '\\faIcon{link}\\hspace{2mm}No links added'
  })()

  const rightExperience = data.experience.length
    ? data.experience
        .map((exp) => {
          const company = escapeLatex(exp.company || 'Organization')
          const role = escapeLatex(exp.position || 'Role')
          const dates = [exp.startDate, exp.endDate].filter(Boolean).map(escapeLatex).join(' - ') || 'Date'
          const bullets = linesFromText(exp.description).map((line) => `\\item ${escapeLatex(line)}`).join('\n') || '\\item'
          return `\\job{${company}}{${role}}{${dates}}
\\begin{itemize}
${bullets}
\\end{itemize}
\\spacevv`
        })
        .join('\n\n')
    : '\\job{Organization}{Role}{Date}'

  const rightProjects = data.projects.length
    ? data.projects
        .map((project) => {
          const name = escapeLatex(project.name || 'Project')
          const date = escapeLatex(project.role || '')
          const title = project.link ? `\\href{${escapeLatex(project.link)}}{${name}}` : name
          const detailLines = [project.technologies, project.description]
            .filter(Boolean)
            .flatMap((value) => linesFromText(value))
            .map((line) => `\\item ${escapeLatex(line)}`)
            .join('\n') || '\\item Project details'
          return `\\project{${title}}{${date}}
\\begin{itemize}
${detailLines}
\\end{itemize}
\\spacevv`
        })
        .join('\n\n')
    : '\\project{name}{date}'

  const rightEducation = data.education.length
    ? data.education
        .map((edu) => {
          const degree = [edu.degree, edu.field].filter(Boolean).map(escapeLatex).join(' in ') || 'Degree'
          const school = escapeLatex(edu.school || 'Institution')
          const date = escapeLatex(edu.graduationDate || '')
          return `\\textsc{${degree}}. \\textit{${school}.} \\dates{${date}}`
        })
        .join('\n\\is\n')
    : '\\textsc{Education not added yet.}'

  return `\\documentclass[11pt]{article}
\\usepackage[reset, a4paper, margin=6mm, top=7mm, right=4mm]{geometry}
\\usepackage{ragged2e}
\\usepackage{xcolor}
\\usepackage{ulem}
\\usepackage{paracol}
\\usepackage{fontspec}
\\usepackage{eso-pic}
\\IfFileExists{fontawesome5.sty}{\\usepackage{fontawesome5}}{\\newcommand{\\faIcon}[1]{\\textbullet}}
\\usepackage{hyperref}
\\usepackage{enumitem}
\\setlist[itemize]{noitemsep, topsep=-2pt, leftmargin=2ex}
\\IfFontExistsTF{CormorantGaramond}{\\setromanfont{CormorantGaramond}}{}
\\IfFontExistsTF{SourceSerifPro}{\\setsansfont{SourceSerifPro}}{}
\\renewcommand{\\familydefault}{\\rmdefault}
\\thispagestyle{empty}
\\parindent=0pt
\\renewcommand{\\ULdepth}{3pt}
\\renewcommand{\\ULthickness}{0.5pt}
\\hypersetup{colorlinks=false,pdfborder={0 0 0}}
\\tolerance=1
\\emergencystretch=\\maxdimen
\\hyphenpenalty=10000
\\hbadness=10000
\\IfFontExistsTF{CormorantGaramond-Light}{\\newfontfamily\\titlethin{CormorantGaramond-Light}}{\\newcommand{\\titlethin}{\\rmfamily}}
\\IfFontExistsTF{CormorantGaramond-Medium}{\\newfontfamily\\titlethick{CormorantGaramond-Medium}}{\\newcommand{\\titlethick}{\\rmfamily\\bfseries}}
\\IfFontExistsTF{CormorantGaramond-Bold}{\\newfontfamily\\titlebold{CormorantGaramond-Bold}}{\\newcommand{\\titlebold}{\\rmfamily\\bfseries}}
\\IfFontExistsTF{SourceSerifPro}{\\newfontfamily\\normaltext{SourceSerifPro}}{\\newcommand{\\normaltext}{\\sffamily}}
\\newcommand{\\resumetitle}[3]{
    \\AddToShipoutPictureBG{\\AtPageUpperLeft {\\raisebox{-0.09\\paperheight}{\\color{black!85}\\rule{2\\paperwidth}{\\paperheight}}}}
    \\begin{Center}
        \\begingroup
        \\titlethin\\color{black!10}\\Huge{#1}
        \\titlethick\\color{black!5}\\Huge{#2} \\\\
        \\vspace{2mm}
        \\textrm{\\color{black!15}\\Large{#3}}
        \\endgroup
    \\end{Center}
    \\vspace{7mm}
}
\\newcommand{\\betteruline}[1]{\\uline{#1}}
\\newcommand{\\sectiontitle}[1]{\\begingroup\\titlebold\\betteruline{\\Large\\uppercase{#1}  }\\vspace{1.7mm}\\endgroup}
\\newcommand{\\sectioncontent}[1]{\\begingroup\\begin{FlushLeft}\\vspace{-3mm}\\sffamily\\small#1\\end{FlushLeft}\\endgroup\\vspace{2mm}}
\\newcommand{\\job}[3]{\\begingroup\\textbf{\\small#1} - \\small#2\\hfill\\color{black!70}\\small{#3}\\endgroup}
\\newcommand{\\project}[2]{\\begingroup\\textbf{\\small#1}\\hfill\\color{black!70}\\small{#2}\\endgroup}
\\newcommand{\\spacevv}{\\vspace{2mm}}
\\newcommand{\\is}{\\par\\vskip.5ex plus .4ex}
\\newcommand{\\dates}[1]{\\hfill\\mbox{\\textbf{#1}}}

\\begin{document}
\\resumetitle{${escapeLatex(first)}}{${escapeLatex(last)}}{${titleLine}}

\\columnratio{0.31}
\\setlength{\\columnsep}{7mm}
\\begin{paracol}{2}

\\sectiontitle{about me}
\\sectioncontent{${summary}}

\\sectiontitle{education}
\\sectioncontent{
${educationLeft}
}

\\sectiontitle{links}
\\sectioncontent{
${linksBlock}
}

\\sectiontitle{skills}
\\sectioncontent{
\\begin{itemize}
${skillsItems}
\\end{itemize}
}

\\switchcolumn

\\sectiontitle{experience}
\\sectioncontent{
${rightExperience}
}

\\sectiontitle{personal projects}
\\sectioncontent{
${rightProjects}
}

\\sectiontitle{education}
\\sectioncontent{
${rightEducation}
}

\\end{paracol}
\\end{document}`
}

function renderClassicResume(data: ResumeDraft): string {
  const contactLine = [data.phone, data.location].filter(Boolean).map(escapeLatex).join(' \\\\ ')
  const emailLine = data.email ? `\\href{mailto:${escapeLatex(data.email)}}{${escapeLatex(data.email)}}` : ''

  const objectiveSection = data.summary.trim()
    ? `\\begin{rSection}{OBJECTIVE}\n${latexParagraph(data.summary)}\n\\end{rSection}\n`
    : ''

  const educationSection = data.education.length
    ? `\\begin{rSection}{Education}\n${data.education
        .map((edu) => {
          const degree = [edu.degree, edu.field].filter(Boolean).map(escapeLatex).join(' in ')
          const school = escapeLatex(edu.school)
          const grad = edu.graduationDate ? `{${escapeLatex(edu.graduationDate)}}` : ''
          return `{\\bf ${degree || 'Education'}}, ${school}${grad ? ` \\hfill ${grad}` : ''}`
        })
        .join('\n\n')}\n\\end{rSection}\n`
    : ''

  const skillsSection = data.skills.length
    ? `\\begin{rSection}{SKILLS}\n${escapeLatex(data.skills.join(', '))}\n\\end{rSection}\n`
    : ''

  const experienceSection = data.experience.length
    ? `\\begin{rSection}{EXPERIENCE}\n${data.experience
        .map((exp) => {
          const title = escapeLatex(exp.position || 'Role')
          const company = escapeLatex(exp.company || 'Company')
          const dates = [exp.startDate, exp.endDate].filter(Boolean).map(escapeLatex).join(' - ')
          const bullets = exp.description
            ? exp.description
                .split(/\r?\n/)
                .map((line) => line.trim())
                .filter(Boolean)
                .map((line) => `\\item ${escapeLatex(line)}`)
                .join('\n')
            : '\\item '
          return `\\textbf{${title}}${dates ? ` \\hfill ${dates}` : ''}\\\\\n${company}\n\\begin{itemize}\n${bullets}\n\\end{itemize}`
        })
        .join('\n\n')}\n\\end{rSection}\n`
    : ''

  const projectsSection = data.projects.length
    ? `\\begin{rSection}{PROJECTS}\n\\vspace{-1.25em}\n${data.projects
        .map((project) => {
          const name = escapeLatex(project.name || 'Project')
          const desc = [project.role, project.technologies, project.description]
            .filter(Boolean)
            .map((x) => escapeLatex(x))
            .join(' - ')
          const link = project.link ? ` \\href{${escapeLatex(project.link)}}{(Link)}` : ''
          return `\\item \\textbf{${name}.} {${desc}${link}}`
        })
        .join('\n')}\n\\end{rSection}\n`
    : ''

  return `\\documentclass{resume}
\\usepackage[left=0.4 in,top=0.4in,right=0.4 in,bottom=0.4in]{geometry}
\\name{${escapeLatex(data.full_name || 'Your Name')}}
\\address{${contactLine || ' '}}
\\address{${emailLine || ' '}}

\\begin{document}
${objectiveSection}
${educationSection}
${skillsSection}
${experienceSection}
${projectsSection}
\\end{document}`
}

export async function renderLatex(data: ResumeDraft): Promise<string> {
  if (data.template_id === 'classic') {
    return renderClassicResume(data)
  }

  if (data.template_id === 'compact') {
    return renderCompactResume(data)
  }

  if (data.template_id === 'modern') {
    return renderModernResume(data)
  }

  const templateFile = templatePathById[data.template_id]
  const templatePath = path.join(process.cwd(), 'lib', 'resume', 'templates', templateFile)
  const template = await fs.readFile(templatePath, 'utf8')

  const contact = [data.email, data.phone, data.location].filter(Boolean).map(escapeLatex).join(' $\\cdot$ ')
  const summary = optionalSection('Summary', latexParagraph(data.summary))
  const experience = optionalSection('Experience', renderExperience(data))
  const projects = optionalSection('Projects', renderProjects(data))
  const education = optionalSection('Education', renderEducation(data))
  const skills = optionalSection('Skills', escapeLatex(data.skills.join(', ')))

  return template
    .replaceAll('[[FULL_NAME]]', escapeLatex(data.full_name))
    .replaceAll('[[CONTACT_LINE]]', contact)
    .replaceAll('[[SUMMARY_SECTION]]', summary)
    .replaceAll('[[EXPERIENCE_SECTION]]', experience)
    .replaceAll('[[PROJECTS_SECTION]]', projects)
    .replaceAll('[[EDUCATION_SECTION]]', education)
    .replaceAll('[[SKILLS_SECTION]]', skills)
}
