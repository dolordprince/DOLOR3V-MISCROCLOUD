# DOLOR3V MICROCloud
# STRICT AI WEBSITE / APP GENERATION CONTRACT
# VERSION 1.0

============================================================
NON-NEGOTIABLE RULE
============================================================

Every generated website or application MUST be:

1. REAL
2. RUNNABLE
3. VISUALLY COMPLETE
4. RESPONSIVE
5. PREVIEWABLE
6. TESTABLE
7. BUILT FROM STRUCTURED JSON VISUAL DATA
8. DESIGNED WITH INTENTIONAL VISUAL HIERARCHY
9. CAPABLE OF USING GENERATED VISUAL ASSETS
10. CAPABLE OF USING 3D / MOTION WHEN APPROPRIATE

NEVER return a design-only concept when the user asks to build an
application or website.

NEVER stop after generating code.

NEVER claim completion before the generated application actually
builds and runs.

============================================================
1. MANDATORY JSON VISUAL PLAN
============================================================

BEFORE generating the final UI implementation, the AI MUST produce
an internal structured JSON visual plan.

The JSON MUST describe:

- application identity
- visual direction
- typography
- color system
- spacing system
- layout
- navigation
- pages
- sections
- components
- responsive behavior
- imagery
- generated visual assets
- gradients
- shadows
- borders
- glass effects
- animation
- 3D objects
- 3D lighting
- camera behavior
- interaction states
- loading states
- empty states
- error states
- accessibility
- preview configuration

Required conceptual structure:

{
  "project": {},
  "visualIdentity": {},
  "typography": {},
  "colors": {},
  "layout": {},
  "pages": [],
  "components": [],
  "visualAssets": [],
  "imageGeneration": {},
  "threeD": {},
  "motion": {},
  "responsive": {},
  "accessibility": {},
  "preview": {},
  "validation": {}
}

The JSON is the source of truth for visual implementation.

The implementation MUST remain consistent with this JSON.

============================================================
2. IMAGE GENERATION IS MANDATORY WHEN VISUALLY APPROPRIATE
============================================================

The AI MUST NOT automatically produce generic placeholder imagery.

When a page requires:

- hero artwork
- product artwork
- editorial imagery
- backgrounds
- illustrations
- 3D-style artwork
- futuristic visual elements
- luxury visual elements
- product mockups
- architectural scenes
- abstract technology visuals

the AI MUST create a structured image-generation specification.

Example:

{
  "assetType": "hero",
  "prompt": "...",
  "style": "...",
  "composition": "...",
  "lighting": "...",
  "materials": "...",
  "camera": "...",
  "aspectRatio": "16:9",
  "purpose": "homepage hero"
}

Do not use meaningless placeholder images such as:

- placeholder.png
- image.jpg
- stock-image
- lorem image
- generic gradient block

unless the user explicitly requests placeholders.

============================================================
3. VISUAL QUALITY STANDARD
============================================================

Generated interfaces MUST have:

- strong visual hierarchy
- clean spacing
- deliberate alignment
- consistent component geometry
- readable typography
- clear primary actions
- clear secondary actions
- strong contrast
- responsive composition
- intentional depth
- polished states

Avoid:

- random cards
- excessive rounded rectangles
- inconsistent spacing
- tiny text
- weak contrast
- default browser styling
- generic dashboard layouts
- excessive gradients
- visual clutter
- meaningless animations
- arbitrary colors
- inconsistent border radii
- inconsistent shadows

Every visual element must have a purpose.

============================================================
4. TYPOGRAPHY
============================================================

Typography MUST be deliberate.

Default requirement:

- bold, highly readable headings
- clear section hierarchy
- strong navigation typography
- readable body text
- clear labels
- accessible contrast

Preferred hierarchy:

Display:
very large / bold

H1:
large / bold

H2:
large / semibold-to-bold

H3:
medium / bold

Body:
comfortable reading size

Labels:
compact but readable

Buttons:
medium-to-bold

Do not use thin typography for primary headings.

Do not make important information visually weak.

============================================================
5. COLOR SYSTEM
============================================================

Every project MUST define a complete color system.

Required:

- background
- surface
- elevated surface
- primary
- secondary
- accent
- text
- muted text
- border
- success
- warning
- error
- focus

Colors MUST be represented in the visual JSON.

Do not randomly select colors during implementation.

============================================================
6. 3D REQUIREMENT
============================================================

When the project is compatible with 3D presentation, the AI MUST
consider 3D as part of the visual design.

Possible 3D elements:

- product models
- floating objects
- spatial cards
- glass objects
- particles
- abstract geometry
- interactive scenes
- depth-based hero sections
- 3D backgrounds
- animated objects
- lighting effects

The 3D scene MUST be represented structurally.

Example:

{
  "threeD": {
    "enabled": true,
    "scene": "hero",
    "objects": [],
    "camera": {},
    "lights": [],
    "materials": [],
    "animation": {},
    "interaction": {}
  }
}

Do NOT add 3D merely for decoration.

3D must improve the visual experience.

============================================================
7. LIVE 3D
============================================================

When enabled, 3D MUST be capable of responding to:

- pointer movement
- touch
- scroll
- application state
- user actions
- AI-generated state
- theme changes

Use efficient rendering.

Do not destroy mobile performance.

Provide a reduced-motion fallback.

Provide a non-3D fallback where necessary.

============================================================
8. MOTION
============================================================

Motion MUST communicate:

- hierarchy
- transition
- feedback
- depth
- state
- interaction

Preferred effects:

- smooth entrance
- subtle parallax
- controlled hover
- spring-like interaction
- scroll-linked transitions
- 3D camera movement
- controlled particles
- loading transitions

NEVER animate everything.

NEVER use animation simply because animation is possible.

============================================================
9. GLASS / DEPTH
============================================================

Glassmorphism may be used when appropriate.

When used, it MUST include:

- controlled transparency
- readable foreground
- sufficient contrast
- subtle border
- intentional backdrop blur
- meaningful depth

Avoid making the entire interface look like translucent plastic.

============================================================
10. RESPONSIVE DESIGN
============================================================

Every generated application MUST work on:

- mobile
- tablet
- desktop
- large desktop

The mobile design MUST NOT simply be a shrunken desktop layout.

Define responsive behavior in the visual JSON.

Required considerations:

- navigation
- typography
- spacing
- grids
- cards
- 3D scenes
- images
- buttons
- forms
- tables
- dialogs

============================================================
11. ACCESSIBILITY
============================================================

Every generated application MUST include:

- semantic HTML
- keyboard navigation
- visible focus states
- accessible labels
- appropriate contrast
- alt text for meaningful images
- reduced-motion support
- usable touch targets

Visual polish MUST NOT override accessibility.

============================================================
12. REAL APPLICATION REQUIREMENT
============================================================

Generated applications MUST contain real:

- routes
- components
- state
- forms
- interactions
- data handling
- error handling
- loading handling
- persistence where required
- backend integration where required

NO MOCK API.

NO FAKE ENDPOINT.

NO SIMULATED DATABASE.

NO FAKE LOGIN.

NO FAKE DEPLOYMENT.

NO PLACEHOLDER FUNCTIONALITY.

============================================================
13. BUILD REQUIREMENT
============================================================

After generation:

1. write files
2. install dependencies
3. run build
4. inspect errors
5. repair errors
6. rerun build
7. start application
8. detect application port
9. expose preview
10. open preview with Browser Run
11. test application
12. capture visual result
13. repair visual/runtime errors
14. repeat until valid

AI MUST NOT declare the application complete before these steps.

============================================================
14. AUTOMATIC PREVIEW REQUIREMENT
============================================================

EVERY SUCCESSFULLY GENERATED APPLICATION MUST PRODUCE A LIVE
PREVIEW.

Required lifecycle:

BUILD_STARTED
FILES_GENERATED
DEPENDENCIES_INSTALLED
BUILD_RUNNING
BUILD_PASSED
SERVER_STARTING
PORT_DETECTED
PREVIEW_CREATING
PREVIEW_READY
BROWSER_TESTING
PREVIEW_VERIFIED

The UI MUST expose:

- Live Preview
- Open Preview
- Refresh Preview
- Test Preview
- Open in New Tab

The preview MUST point to the actual running generated application.

It MUST NOT point to:

- a static screenshot
- a fake URL
- a placeholder page
- the builder dashboard
- an unrelated deployment

============================================================
15. CLOUDFLARE SANDBOX
============================================================

Use Cloudflare Sandbox as the isolated execution environment.

For the Sandbox 1.0 preview:

@cloudflare/sandbox@next

The generated application may execute:

- npm
- pnpm
- bun
- node
- python
- build commands
- development servers
- test commands

Use process handles.

Wait for:

- process startup
- build completion
- server readiness
- port availability

Do not assume a process is ready merely because it started.

============================================================
16. PREVIEW URL
============================================================

The preview URL MUST correspond to the actual running process.

The AI MUST:

1. identify the application port
2. verify that the port is listening
3. expose the service
4. obtain the preview URL
5. request the URL
6. verify HTTP success
7. open it in Browser Run
8. verify the rendered application

Only then:

PREVIEW_READY

============================================================
17. BROWSER RUN
============================================================

Use Cloudflare Browser Run for real validation.

Browser Run may be used for:

- page loading
- screenshots
- DOM inspection
- interaction testing
- console inspection
- responsive testing
- visual verification
- automated browser testing

Use Puppeteer / Playwright / CDP where appropriate.

Browser Run MUST test the actual generated preview.

It MUST NOT test a fake representation of the application.

============================================================
18. VISUAL VALIDATION
============================================================

After the application starts, Browser Run MUST inspect:

- page loads
- no fatal console errors
- primary navigation
- hero
- typography
- images
- responsive layout
- primary interactions
- forms
- major sections
- 3D scene where enabled

When visual output is wrong:

BUILD_VALID
does NOT mean
PREVIEW_VALID

The AI MUST repair the application.

============================================================
19. WEBMCP
============================================================

When the generated website exposes WebMCP tools and Browser Run
supports the required environment:

1. inspect available WebMCP tools
2. prefer structured WebMCP operations
3. inspect tool schemas
4. execute typed operations
5. re-check available tools after state changes

Do NOT create a fake HTTP endpoint and call it WebMCP.

WebMCP availability MUST be detected from the browser environment.

============================================================
20. IMAGE + 3D JSON CONSISTENCY
============================================================

The visual JSON, generated images, 3D scene and implemented UI
MUST describe the same design language.

Example:

If the JSON says:

"style": "luxury dark glass"

then:

- typography
- colors
- cards
- images
- 3D materials
- lighting
- buttons
- navigation

must reflect that direction.

Do not generate a luxury JSON plan and implement a generic dashboard.

============================================================
21. DESIGN INTELLIGENCE
============================================================

The AI MUST interpret the user's visual intent.

If the user provides:

- screenshot
- reference image
- sketch
- design
- moodboard
- existing website

the AI MUST analyze:

- composition
- spacing
- typography
- color
- hierarchy
- imagery
- depth
- lighting
- component structure
- responsive behavior

Then convert the analysis into the visual JSON.

Do not blindly copy pixels.

Understand the design system.

============================================================
22. APPLICATION COMPLETION CONTRACT
============================================================

A task is NOT complete when:

- code exists
- files exist
- npm install succeeds
- TypeScript passes
- build passes

A task is complete ONLY when:

BUILD_PASSED
AND
SERVER_READY
AND
PREVIEW_READY
AND
BROWSER_TEST_PASSED

============================================================
23. FAILURE RECOVERY
============================================================

If build fails:

capture stderr
 identify failure
 repair
 rebuild

If server fails:

capture logs
 identify failure
 repair
 restart

If preview fails:

verify process
 verify port
 verify tunnel
 verify URL
 retry

If browser test fails:

capture:
- URL
- console errors
- page state
- screenshot

 repair
 rebuild
 retest

============================================================
24. FINAL RESPONSE FROM THE AI
============================================================

After successful generation, report:

{
  "status": "PREVIEW_READY",
  "build": "passed",
  "server": "running",
  "preview": {
    "ready": true,
    "url": "...",
    "verified": true
  },
  "browserTest": {
    "passed": true
  },
  "visual": {
    "jsonPlan": true,
    "images": true,
    "threeD": true
  }
}

Never report success if preview verification failed.

============================================================
25. ABSOLUTE PROHIBITIONS
============================================================

NEVER:

- fake preview
- fake URL
- fake browser test
- fake WebMCP
- placeholder images
- generic UI when visual intent is provided
- unfinished 3D
- meaningless animations
- tiny weak headings
- inaccessible text
- static screenshot pretending to be an app
- declare success before runtime verification
- silently remove existing real functionality
- silently replace the user's assets
- invent an endpoint
- claim Browser Run tested something it did not actually test

============================================================
FINAL RULE
============================================================

DOLOR3V is an AI SOFTWARE FACTORY.

It does not merely generate code.

It generates:

DESIGN
+
JSON VISUAL PLAN
+
IMAGE ASSETS
+
3D / MOTION
+
REAL CODE
+
REAL RUNTIME
+
REAL PREVIEW
+
REAL BROWSER TEST
+
REAL DEPLOYMENT

The generated application must be visually polished, clean,
responsive, bold, readable, interactive and actually runnable.

============================================================
END OF CONTRACT
============================================================
