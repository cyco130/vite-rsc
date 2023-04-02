import styles from "./Footer.module.scss";

export default function Footer() {
	return (
		<footer className={styles.footer}>
			<p>
				© {new Date().getFullYear()} The Nuxt Movies authors. All rights
				reserved.{" "}
				<a
					target="_blank"
					href="https://jason.codes/cookie-policy"
					rel="noopener"
				>
					Cookie Policy
				</a>
				.
			</p>
			<p>
				Designed by the Nuxt Movies authors, and ported by the Solid Movies
				authors, with the original data provided by{" "}
				<a target="_blank" href="https://www.themoviedb.org/" rel="noopener">
					TMDb
				</a>
				.
			</p>

			<ul className="nolist">
				<li>
					<a
						href="https://twitter.com/solidjs"
						target="_blank"
						aria-label="Link to Twitter account"
						rel="noopener"
					>
						<i className="i-ant-design-twitter-outlined w-8 h-8" />
					</a>
				</li>
				<li>
					<a
						href="https://github.com/solidjs/solid-start/tree/movies/examples/movies"
						target="_blank"
						aria-label="Link to GitHub account"
						rel="noopener"
					>
						<i className="i-ant-design-github-outlined w-8 h-8" />
					</a>
				</li>
				<li>
					<a
						href="mailto:hello@jason.codes"
						aria-label="Link to Email"
						rel="noopener"
					>
						<i className="i-ant-design-mail-filled w-8 h-8" />
					</a>
				</li>
			</ul>
		</footer>
	);
}
