import A from "../../modules/router/A";
import styles from "./Nav.module.scss";
import logo from "~/assets/images/logo.webp";

export default function Nav() {
	return (
		<nav className={styles.nav}>
			<ul className="nolist">
				<li className={styles.logo}>
					<img src={logo} width={48} height={48} alt="solid logo" />
				</li>
				<li>
					<A href="/">
						<i className="i-ant-design-home-outlined w-8 h-8" />
					</A>
				</li>
				<li>
					<A href="/movie" aria-label="Movies">
						<i className="i-pepicons-clapperboard w-8 h-8" />
					</A>
				</li>
				<li>
					<A href="/tv" aria-label="TV Shows">
						<i className="i-pepicons-television w-8 h-8" />
					</A>
				</li>
				<li>
					<A href="/search" aria-label="Search">
						<i className="i-ant-design-search-outlined w-8 h-8" />
					</A>
				</li>
			</ul>
		</nav>
	);
}
