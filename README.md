# cor.nz

A dependency-free personal portfolio inspired by the 2002 GeekBoys / SoGamed portal design. The implementation keeps the old-web character — ASCII masthead, black/amber palette, dense information blocks — while using semantic HTML, responsive CSS Grid and accessible vanilla JavaScript.

## Preview

```sh
npm run preview
```

Then open [http://localhost:4173](http://localhost:4173).
The preview server listens on all network interfaces; other devices on the same
LAN can use `http://<LAN-IP>:4173`.

No install step is required. There are no runtime or development dependencies.

The terminal in the hero is interactive. `ls` lists the available text files;
use commands such as `cat cv.txt`, `cat projects.txt` or `cat skills.txt` to
read them. `help`, `pwd`, `uname -a`, `history` and `clear` are also available.
Tab completes commands and file names; arrow-up and arrow-down browse command
history.

## Tests

```sh
npm test
```

The checks use Node's built-in test runner and verify the static-site structure, internal links, external-link safety and zero-dependency constraint.

## Publishing checklist

Review these items before deployment:

- Update project impact, responsibilities and stack where you can share more detail.
- Confirm whether BearCode.me should remain in the public project list.
- Add a CV PDF only after choosing the public document.
- Recheck the hosting, logging and contact details in the legal pages before deployment.

## Design references

- [GeekBoys, September 2002](https://web.archive.org/web/20020922031334/http://geekboys.org/)
- [SoGamed, November 2002](https://web.archive.org/web/20021130085702/http://www.sogamed.com/)
- [Brittany Chiang](https://brittanychiang.com/)
- [Anthony Fu](https://antfu.me/)
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
