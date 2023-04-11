import { createRouter } from "flight-router/server";
import { A, PageProps } from "flight-router";
import { Assets } from "stream-react/assets";
import { getContacts, getContact, Contact } from "./contacts";
import "./root.css";

async function ContactPage({ params }: PageProps) {
	const contact = await getContact(params.contactId);

	if (!contact) {
		return <div>Contact not found</div>;
	}

	return (
		<div id="contact">
			<div>
				<img key={contact.avatar} src={contact.avatar} />
			</div>

			<div>
				<h1>
					{contact.first || contact.last ? (
						<>
							{contact.first} {contact.last}
						</>
					) : (
						<i>No Name</i>
					)}{" "}
					<Favorite contact={contact} />
				</h1>

				{contact.twitter && (
					<p>
						<a target="_blank" href={`https://twitter.com/${contact.twitter}`}>
							{contact.twitter}
						</a>
					</p>
				)}

				{contact.notes && <p>{contact.notes}</p>}

				<div>
					<form action="edit">
						<button type="submit">Edit</button>
					</form>
					<form
						method="post"
						action="destroy"
						// onSubmit={(event) => {
						// 	if (!confirm("Please confirm you want to delete this record.")) {
						// 		event.preventDefault();
						// 	}
						// }}
					>
						<button type="submit">Delete</button>
					</form>
				</div>
			</div>
		</div>
	);
}

function Favorite({ contact }: { contact: Contact }) {
	// yes, this is a `let` for later
	let favorite = contact.favorite;
	return (
		<form method="post">
			<button
				name="favorite"
				value={favorite ? "false" : "true"}
				aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
			>
				{favorite ? "★" : "☆"}
			</button>
		</form>
	);
}

async function Root({ children }: { children: any }) {
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

export default createRouter([
	{
		path: "",
		component: Root,
		children: [
			{
				path: "contacts/:contactId",
				component: ContactPage,
			},
		],
	},
]);
