import { A } from "fully-react/link";
import { IComment } from "~/types";
import Toggle from "./toggle";

function Comment(props: { comment: IComment }) {
	return (
		<li className="comment">
			<div className="by">
				<A href={`/users/${props.comment.user}`}>{props.comment.user}</A>{" "}
				{props.comment.time_ago} ago
			</div>
			<div
				className="text"
				dangerouslySetInnerHTML={{ __html: props.comment.content }}
			/>
			{props.comment.comments.length ? (
				<Toggle>
					{props.comment.comments.map((comment) => (
						<Comment comment={comment} />
					))}
				</Toggle>
			) : null}
		</li>
	);
}

export default Comment;
