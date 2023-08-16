import { type PageProps } from "fully-react/app-router";
import { getContact, Contact } from "../../contacts";

export default async function Contact({ params }: PageProps) {
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
