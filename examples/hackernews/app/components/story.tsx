import { A } from "fully-react";
import { IStory } from "~/types";

function Story(props: { story: IStory }) {
	return (
		<li className="news-item">
			<span className="score">{props.story.points}</span>
			<span className="title">
				{props.story.url ? (
					<>
						<a href={props.story.url} target="_blank" rel="noreferrer">
							{props.story.title}
							<span className="host"> ({props.story.domain})</span>
						</a>
					</>
				) : (
					<A href={`/item/${props.story.id}`}>{props.story.title}</A>
				)}
			</span>
			<br />
			<span className="meta">
				{props.story.type !== "job" ? (
					<>
						by <A href={`/users/${props.story.user}`}>{props.story.user}</A>{" "}
						{props.story.time_ago} |{" "}
						<A href={`/stories/${props.story.id}`}>
							{props.story.comments_count
								? `${props.story.comments_count} comments`
								: "discuss"}
						</A>
					</>
				) : (
					<A href={`/stories/${props.story.id}`}>{props.story.time_ago}</A>
				)}
			</span>
			{props.story.type !== "link" ? (
				<span className="label">{props.story.type}</span>
			) : null}
		</li>
	);
}

export default Story;
