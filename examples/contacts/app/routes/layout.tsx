import { A } from "fully-react/app-router";
import { Assets } from "fully-react/assets";
import { getContacts } from "../contacts";

export default async function Layout({ children }: { children: any }) {
	const contacts = await getContacts();
	return (
		<html lang="en">
			<head>
				<title>RSC Playground</title>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" type="image/x-icon" href="/favicon.ico" />
				<Assets />
			</head>
			<body>
				<div id="root">
					<div id="sidebar">
						<div>
							<form id="search-form" role="search">
								<input
									id="q"
									aria-label="Search contacts"
									placeholder="Search"
									type="search"
									name="q"
								/>
								<div id="search-spinner" aria-hidden hidden={true} />
								<div className="sr-only" aria-live="polite"></div>
							</form>
							<form method="post">
								<button type="submit">New</button>
							</form>
						</div>
						<nav>
							{contacts.length ? (
								<ul>
									{contacts.map((contact) => (
										<li key={contact.id}>
											<A href={`/contacts/${contact.id}`}>
												{contact.first || contact.last ? (
													<>
														{contact.first} {contact.last}
													</>
												) : (
													<i>No Name</i>
												)}{" "}
												{contact.favorite && <span>★</span>}
											</A>
										</li>
									))}
								</ul>
							) : (
								<p>
									<i>No contacts</i>
								</p>
							)}
						</nav>
					</div>
					<div id="detail">{children}</div>
				</div>
			</body>
		</html>
	);
}
