# `brands/<slug>/legal`

The brand's legal and support pages. The `angular.json` configuration copies this directory to
`/assetshtml`, and `src/app/help/help-pages/static-file-paths.ts` fetches the files from there and
drops them into the help routes. The file names and the directory layout are part of that contract:
adding a page means editing `static-file-paths.ts` as well, renaming one breaks a route.

Each file is a **fragment**, not a full document: no `<html>`, `<head>` or `<body>`, just the markup
that goes inside the page container. Inline `<style>` is allowed; classes from the app's stylesheet
are not — `src/main.scss` excludes this directory from the Tailwind scan
(`@source not "../brands/*/legal"`), so a utility class used only here produces no CSS.

Delete this README in the real brand directory.

## Expected files

| Path                                            | Route             | Content                                          |
| ----------------------------------------------- | ----------------- | ------------------------------------------------ |
| `terms-and-conditions/terms-and-conditions.html`| `/terms-and-conditions` | General terms and conditions               |
| `privacy-policy/privacy-policy.html`            | `/privacy-policy` | Privacy policy / data protection                 |
| `aml/aml.html`                                  | `/aml-policy`     | Anti-money-laundering policy                     |
| `responsible-gaming/responsible-gaming.html`    | `/rgl`            | Responsible gaming policy                        |
| `sportsbook/sportsbook-annex.html`              | help routes       | Sportsbook rules annex                           |
| `contact/contact.html`                          | help routes       | Contact details                                  |
| `support/support.html`                          | help routes       | Technical support / FAQ                          |
| `ouvidoria/ouvidoria.html`                      | `/customer-support` | Ombudsman ("ouvidoria") channel, required by SPA/MF |

A brand that does not offer sports betting still needs the `sportsbook/` file to exist (an empty
fragment is fine) unless the corresponding entry is removed from `static-file-paths.ts`.
