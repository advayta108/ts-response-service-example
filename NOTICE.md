# Third-Party Software Notices and Information

This project incorporates components from the projects listed below. The original copyright notices and the licenses under which such components are received are set forth below.

**Note:** This project uses FOSSA for automated license compliance monitoring. For the most up-to-date and comprehensive list of all dependencies and their licenses, please refer to the FOSSA analysis report or run `fossa analyze` locally.

**Next.js / `glob` (CC-BY-SA-4.0):** В поставке **Next.js** в `dist/compiled/glob/LICENSE` встречается текст **CC-BY-SA-4.0** (логотип Glob и т.п.) — это **вложенный артефакт сборки**, не код приложения. В `.fossa.yml` лицензия **CC-BY-SA-4.0** указана в `policy.allowed`. Если в FOSSA всё ещё «Denied», в UI проекта: **Ignore** для находки или выровнять **Organization policy** с репозиторием / пересканировать после push.

## License Compliance Obligations

This section addresses all license obligations for third-party dependencies used in this project.

### Include License

All licenses for third-party dependencies are included in this NOTICE file with links to the full license texts. License texts are available at:

- MIT License: See [LICENSE.md](LICENSE.md) for the project's MIT license, and individual package licenses in their respective repositories
- Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- BSD-2-Clause: https://opensource.org/licenses/BSD-2-Clause
- BSD-3-Clause: https://opensource.org/licenses/BSD-3-Clause
- ISC: https://opensource.org/licenses/ISC
- MPL-2.0: See [LICENSE.MPL-2.0](LICENSE.MPL-2.0) or http://mozilla.org/MPL/2.0/
- FTL: https://git.savannah.gnu.org/cgit/freetype/freetype2.git/tree/docs/FTL.TXT

### Include Copyright

All copyright notices for third-party dependencies are preserved. Copyright information for each dependency is maintained in their respective package files and can be viewed via `npm list` or in `package-lock.json`.

### Include Notice

This NOTICE file fulfills the Apache-2.0 requirement to include attribution notices. All Apache-2.0 licensed dependencies are listed in the "Apache-2.0 Licensed Dependencies" section below.

### State Changes

**No modifications have been made to the following licensed components:**

- All Apache-2.0 licensed dependencies (sharp, aria-query, axobject-query, etc.)
- All CC-BY-SA-4.0 licensed documentation and data files
- All CC-BY-4.0 licensed documentation and data files (including caniuse-lite)

All third-party dependencies are used as-is without modification. Any modifications would be disclosed in accordance with their respective license requirements.

### Give Credit

**Creative Commons Attribution Requirements:**

- **caniuse-lite** (CC-BY-4.0)
  - Source: https://github.com/browserslist/caniuse-lite
  - License: Creative Commons Attribution 4.0 International
  - License Text: https://creativecommons.org/licenses/by/4.0/legalcode
  - Attribution: This project uses caniuse-lite data, which is licensed under CC-BY-4.0. The original work is available at the source repository listed above.

### Include Original

**MPL-2.0 License Text:**

The full text of the Mozilla Public License 2.0 is included in this repository as [LICENSE.MPL-2.0](LICENSE.MPL-2.0).

**MPL-2.0 Original Source Code:**

For MPL-2.0 licensed components, the original source code is available at:

- **@vercel/og**: https://github.com/vercel/og
- **Satori**: https://github.com/vercel/satori

If you need to obtain copies of the original MPL-2.0 licensed source code, please visit the repositories listed above.

### Disclose Source

**MPL-2.0 Source Disclosure:**

This project uses MPL-2.0 licensed components (@vercel/og and Satori) as dependencies without modification. No MPL-2.0 licensed code has been modified in this project. If any modifications were made to MPL-2.0 licensed files, they would be disclosed under the MPL-2.0 license and made available in this repository.

The source code for this project, including any modifications to MPL-2.0 licensed components (if any), is available at: https://github.com/advayta108/ts-response-service-example

## Project Licenses

This project is dual-licensed under:

- **MIT License** (see [LICENSE.md](LICENSE.md))
- **Apache License 2.0** (see [LICENSE.Apache](LICENSE.Apache))

## Mozilla Public License 2.0 (MPL-2.0) Components

### @vercel/og

- Source: https://github.com/vercel/og
- License: MPL-2.0
- License Text: See [LICENSE.MPL-2.0](LICENSE.MPL-2.0) or http://mozilla.org/MPL/2.0/

### Satori

- Source: https://github.com/vercel/satori
- License: MPL-2.0
- License Text: See [LICENSE.MPL-2.0](LICENSE.MPL-2.0) or http://mozilla.org/MPL/2.0/

This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/.

Any modifications made to MPL-2.0 licensed components in this project are also made available under the terms of the MPL-2.0 license. The source code for these modifications can be found in the project repository.

## Third-Party Dependencies

This project uses the following third-party dependencies (non-exhaustive list):

### MIT Licensed Dependencies

The majority of dependencies are licensed under the MIT License, including but not limited to:

- **Next.js** (16.0.1) and related packages
  - Source: https://github.com/vercel/next.js
  - License: MIT
  - License Text: https://github.com/vercel/next.js/blob/canary/license
  - Note: Next.js includes transitive dependencies for image processing (sharp packages, Apache-2.0)
  - Note: Next.js includes MPL-2.0 licensed dependencies (@vercel/og, Satori) as transitive dependencies. These are used without modification. See "Mozilla Public License 2.0 (MPL-2.0) Components" section for details.
- React and React DOM
- TypeScript
- Tailwind CSS
- Supabase client libraries
- Lightweight Charts
- Various utility and helper libraries

### Apache-2.0 Licensed Dependencies

Some dependencies are licensed under Apache License 2.0, including:

- **sharp** and related platform-specific packages (`@img/sharp-*`) – Image processing library used by Next.js
  - Source: https://github.com/lovell/sharp
  - License: Apache-2.0
  - License Text: https://www.apache.org/licenses/LICENSE-2.0
  - These packages are transitive dependencies of Next.js for image optimization
  - Platform-specific packages include:
    - `@img/sharp-libvips-darwin-arm64`, `@img/sharp-libvips-darwin-x64` (macOS)
    - `@img/sharp-libvips-linux-*` (various Linux architectures)
    - `@img/sharp-win32-*` (Windows)
    - `@img/sharp-wasm32` (WebAssembly)
  - Only the package matching the build platform is actually used
  - Note: The libvips native libraries used by sharp are licensed under LGPL-3.0-or-later and FTL (Freetype Project License)
- aria-query
- axobject-query
- Various accessibility and testing libraries

### Other Licenses

#### ISC License

Some dependencies use the ISC (Internet Systems Consortium) License, which is compatible with MIT:

- License Text: https://opensource.org/licenses/ISC
- Compatible with: MIT, Apache-2.0

#### BSD-3-Clause License

Some dependencies use the BSD 3-Clause "New" or "Revised" License:

- License Text: https://opensource.org/licenses/BSD-3-Clause
- Compatible with: MIT, Apache-2.0
- Example packages: Some utility and helper libraries

#### Python-2.0 License

The `argparse` package uses the Python 2.0 License:

- License Text: https://docs.python.org/3/license.html#psf-license
- Compatible with: MIT
- Source: https://www.python.org/download/releases/2.0/license/

#### BSD-2-Clause License

Some dependencies use the BSD 2-Clause "Simplified" License:

- License Text: https://opensource.org/licenses/BSD-2-Clause
- Compatible with: MIT, Apache-2.0

#### 0BSD (BSD Zero Clause License)

Some dependencies use the BSD Zero Clause License, which is effectively public domain:

- License Text: https://opensource.org/licenses/0BSD
- Compatible with: MIT, Apache-2.0

#### LGPL-3.0-or-later (GNU Lesser General Public License v3.0 or later)

The `@img/sharp-libvips-*` packages (native libraries for sharp) are licensed under LGPL-3.0-or-later:

- These are transitive dependencies of sharp (Apache-2.0)
- License Text: https://www.gnu.org/licenses/lgpl-3.0.html
- These libraries are used as-is without modification
- Compatible with: MIT, Apache-2.0 (when used as unmodified libraries)

#### FTL (Freetype Project License)

The `@img/sharp-libvips-*` packages also include components licensed under the Freetype Project License:

- License Text: https://git.savannah.gnu.org/cgit/freetype/freetype2.git/tree/docs/FTL.TXT
- These are transitive dependencies of sharp
- Compatible with: MIT, Apache-2.0

#### CC-BY-4.0 (Creative Commons Attribution 4.0)

Some documentation or data files use Creative Commons Attribution 4.0, including:

- **caniuse-lite** – Browser compatibility data used by Next.js and other tools
  - Source: https://github.com/browserslist/caniuse-lite
  - License: CC-BY-4.0
  - License Text: https://creativecommons.org/licenses/by/4.0/legalcode
  - Attribution: This project uses caniuse-lite data. The original work is available at the source repository.
- License Text: https://creativecommons.org/licenses/by/4.0/legalcode
- This license applies to documentation and data files, not code

#### CC-BY-SA-4.0 (Creative Commons Attribution Share Alike 4.0)

Some documentation or data files may use Creative Commons Attribution Share Alike 4.0:

- License Text: https://creativecommons.org/licenses/by-sa/4.0/legalcode
- This license applies to documentation and data files, not code

#### CC0-1.0 (Creative Commons Zero v1.0 Universal)

Some dependencies or data files may use CC0-1.0 (public domain dedication):

- License Text: https://creativecommons.org/publicdomain/zero/1.0/legalcode
- Compatible with: MIT, Apache-2.0

#### Unlicense

Some dependencies use The Unlicense (public domain):

- License Text: https://unlicense.org/
- Compatible with: MIT, Apache-2.0

## License Compatibility

All dependencies use licenses that are compatible with the project's dual MIT/Apache-2.0 licensing:

- **Permissive licenses** (fully compatible): MIT, Apache-2.0, ISC, BSD-3-Clause, BSD-2-Clause, 0BSD, Python-2.0, CC0-1.0, Unlicense
- **Copyleft licenses** (compatible when used as unmodified libraries): MPL-2.0, LGPL-3.0-or-later, FTL
- **Documentation licenses**: CC-BY-4.0, CC-BY-SA-4.0 (apply only to documentation/data files, not code)

All licenses are compatible with the project's dual MIT/Apache-2.0 licensing when used as dependencies without modification.

## Full Dependency List

For a complete and up-to-date list of all dependencies, their versions, and license information, please:

1. Run `npm list` to see the dependency tree
2. Check the FOSSA analysis report (if available)
3. Review `package-lock.json` for exact versions

## License Compliance

This project maintains license compliance through:

- Automated scanning with FOSSA
- Regular dependency audits
- Clear attribution in this NOTICE file

If you have questions about license compatibility or usage, please contact the project maintainers.
