import fetchAPI from "~/api";
import { PageProps } from "./[id].types";

export default async function UserPage({ params }: PageProps) {
	let user = await fetchAPI<IUser>(`user/${params.id}`);
	return (
		<div className="user-view">
			{!user!.error ? (
				<>
					<h1>User : {user!.id}</h1>
					<ul className="meta">
						<li>
							<span className="label">Created:</span> {user!.created}
						</li>
						<li>
							<span className="label">Karma:</span> {user!.karma}
						</li>
						{user!.about ? (
							<li
								dangerouslySetInnerHTML={{ __html: user!.about }}
								className="about"
							/>
						) : null}
					</ul>
					<p className="links">
						<a href={`https://news.ycombinator.com/submitted?id=${user!.id}`}>
							submissions
						</a>{" "}
						|{" "}
						<a href={`https://news.ycombinator.com/threads?id=${user!.id}`}>
							comments
						</a>
					</p>
				</>
			) : (
				<div>User not found</div>
			)}{" "}
		</div>
	);
}

interface IUser {
	error: string;
	id: string;
	created: string;
	karma: number;
	about: string;
}
