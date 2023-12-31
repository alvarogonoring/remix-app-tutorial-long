import { db } from "@/utils/db.server";
import { validateJokeContent, validateJokeName } from "@/utils/helpers";
import { badRequest } from "@/utils/request.server";
import { redirect, json } from "@remix-run/node";
import type { LoaderArgs, ActionArgs } from "@remix-run/node";

import { Link, isRouteErrorResponse, useActionData, useRouteError, Form, useNavigation } from "@remix-run/react";
import { getUserId, requireUserId } from "@/utils/session.server";
import { JokeDisplay } from "@/components/joke";

export const action = async ({ request }: ActionArgs) => {
    const userId = await requireUserId(request);
    const form = await request.formData();
    const content = form.get('content');
    const name = form.get('name');

    if (
        typeof content !== 'string' ||
        typeof name !== 'string'
    ) {
        return badRequest({
            fieldErrors: null,
            fields: null,
            formError: 'Form not submitted correctly.'
        })
    }

    const fieldErrors = {
        content: validateJokeContent(content),
        name: validateJokeName(name)
    }

    const fields = { content, name };

    if (Object.values(fieldErrors).some(Boolean)) {
        return badRequest({
            fieldErrors,
            fields,
            formError: null
        })
    }

    const joke = await db.joke.create({
        data: { ...fields, jokesterId: userId }
    });
    return redirect(`/jokes/${joke.id}`)
}

export const loader = async ({ request }: LoaderArgs) => {
    const userId = await getUserId(request);
    if (!userId) {
        throw new Response('Unauthorized', { status: 401 })
    }

    return json({})
}

export default function NewRoute() {
    const actionData = useActionData<typeof action>();
    const navigation = useNavigation();

    if (navigation.formData) {
        const content = navigation.formData.get('content');
        const name = navigation.formData.get('name');

        if (
            typeof content === 'string' &&
            typeof name === 'string' &&
            !validateJokeContent(content) &&
            !validateJokeName(content)
        ) {
            return (
                <JokeDisplay
                    canDelete={false}
                    isOwner={true}
                    joke={{ name, content }}
                />
            )
        }
    }

    return (
        <div>
            <p>Add your own hilarious joke</p>
            <Form method="post">
                <div>
                    <label>
                        Name:{" "}
                        <input
                            defaultValue={actionData?.fields?.name}
                            name="name"
                            type="text"
                            aria-invalid={Boolean(
                                actionData?.fieldErrors?.name
                            )}
                            aria-errormessage={
                                actionData?.fieldErrors?.name
                                    ? "name-error"
                                    : undefined
                            }
                        />
                    </label>
                    {actionData?.fieldErrors?.name ? (
                        <p
                            className="form-validation-error"
                            id="name-error"
                            role="alert"
                        >
                            {actionData.fieldErrors.name}
                        </p>
                    ) : null}
                </div>
                <div>
                    <label>
                        Content:{" "}
                        <textarea
                            defaultValue={actionData?.fields?.content}
                            name="content"
                            aria-invalid={Boolean(
                                actionData?.fieldErrors?.content
                            )}
                            aria-errormessage={
                                actionData?.fieldErrors?.content
                                    ? "content-error"
                                    : undefined
                            }
                        />
                    </label>
                    {actionData?.fieldErrors?.content ? (
                        <p
                            className="form-validation-error"
                            id="content-error"
                            role="alert"
                        >
                            {actionData.fieldErrors.content}
                        </p>
                    ) : null}
                </div>
                <div>
                    {actionData?.formError ? (
                        <p
                            className="form-validation-error"
                            role="alert"
                        >
                            {actionData.formError}
                        </p>
                    ) : null}
                    <button type="submit" className="button">
                        Add
                    </button>
                </div>
            </Form>
        </div>
    )
}

export function ErrorBoundary() {
    const error = useRouteError();
    console.error(error);

    if (isRouteErrorResponse(error) && error.status === 401) {
        return (
            <div className="error-container">
                <p>You must be logged in to create a joke.</p>
                <Link to="/login">Login</Link>
            </div>
        )
    }

    return (
        <div className="error-container">
            Something unexpected went wrong. Sorry about that.
        </div>
    )
}