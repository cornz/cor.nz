# cor.nz

A dependency-free personal portfolio based on the 2002 GeekBoys and SoGamed websites. The design keeps their ASCII masthead, flat separators and compact horizontal navigation. A 780-pixel page width, 14-pixel body text and a modern monospace font improve readability. Fixedsys-style text remains in the navigation and small labels. The light theme uses an inverted paper-like palette. The dark theme uses the original grey, orange and black colour scheme.

## Preview

```sh
npm run preview
```

Then open [http://localhost:4173](http://localhost:4173).
The preview server listens on all network interfaces; other devices on the same
LAN can use `http://<LAN-IP>:4173`.

No install step is required. There are no runtime or development dependencies.

## Tests

```sh
npm test
```

The checks use Node's built-in test runner and verify the static-site structure, internal links, external-link safety and zero-dependency constraint.

## Design references

- [GeekBoys, September 2002](https://web.archive.org/web/20020922031334/http://geekboys.org/)
- [SoGamed, November 2002](https://web.archive.org/web/20021130085702/http://www.sogamed.com/)
- [Tania Rascia](https://www.taniarascia.com/)
- [Julia Evans](https://jvns.ca/)
- [Simon Willison](https://simonwillison.net/)

All site code is local. No external fonts, analytics scripts, npm packages or JavaScript libraries are loaded.

## License

The source code is available under the [MIT License](LICENSE).

Written content and images, including `portrait.jpg`, are copyright
Cornelius Putzler-Marci and are not covered by the MIT License.

Locally hosted technology icons and their terms are documented in
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
