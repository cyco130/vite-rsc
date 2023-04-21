import { getCount, increment } from "../actions";

import { Button } from "@/components/ui/button";
import { Form } from "fully-react/form";
import FormDemo from "../form";
import { Link } from "@/components/link";

export default async function Browse() {
	return (
		<div>
			<Form action={increment}>
				<div>{await getCount()}</div>
				<Button>Increment</Button>
			</Form>
			<FormDemo>
				<Form.Action action={increment} />
			</FormDemo>
			<Link
				to="/library/:library"
				params={{
					library: "test",
				}}
			/>
		</div>
	);
}
