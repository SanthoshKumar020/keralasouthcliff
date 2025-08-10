Lighthouse Audit & Fix Checklist
--------------------------------
Run `npm run dev` and then `npm run lighthouse` to generate a report (uses Lighthouse CI autorun).

Common fixes and where they are applied in this project:
1. Reduce unused JS
   - Audit large dependencies; load heavy libs only client-side via dynamic imports (we used dynamic for Three.js scene and TipTap where possible).
2. Optimize fonts
   - Use font-display: swap and host fonts locally or use preconnect to Google Fonts. Add <link rel='preconnect' href='https://fonts.gstatic.com'> and preload key fonts.
3. Image optimization
   - Use Next.js Image component and an image CDN (UploadThing CDN or Cloudinary). Serve WebP/AVIF formats via Cloudinary.
4. Remove render-blocking resources
   - Inline critical CSS for hero, defer non-critical scripts with next/script strategy="lazyOnload".
5. Reduce main-thread work
   - Split large bundles; use dynamic imports for admin heavy libs so public pages stay light.
6. Accessibility & Best practices
   - Add alt attributes, ARIA roles for interactive elements, and ensure color contrast for buttons.

After running Lighthouse, note the scores, apply targeted fixes, and re-run to compare before/after. If you want, I can run these steps locally with access to a proper Chrome environment and return the audited report and changes.
