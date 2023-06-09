import { A } from "fully-react/link";
import Comment from "~/components/comment";
import { IStory } from "~/types";
import { PageProps } from "./[id].types";
import fetchAPI from "~/api";

export default async function StoryPage({ params }: PageProps) {
	const story = await fetchAPI<IStory>(`item/${params.id}`);
	return (
		<div className="item-view">
			<div className="item-view-header">
				<a href={story.url} target="_blank">
					<h1>{story.title}</h1>
				</a>
				{story.domain ? <span className="host">({story.domain})</span> : null}
				<p className="meta">
					{story.points} points | by{" "}
					<A href={`/users/${story.user}`}>{story.user}</A> {story.time_ago} ago
				</p>
			</div>
			<div className="item-view-comments">
				<p className="item-view-comments-header">
					{story.comments_count
						? story.comments_count + " comments"
						: "No comments yet."}
				</p>
				<ul className="comment-children">
					{story.comments.map((comment) => (
						<Comment comment={comment} />
					))}
					{/* <For each={story.comments}>
						{(comment) => <Comment comment={comment} />}
					</For> */}
				</ul>
			</div>
		</div>
	);
}
