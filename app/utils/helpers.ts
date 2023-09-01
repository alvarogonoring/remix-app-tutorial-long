export function validateJokeContent(content: string) {
    if (!content) {
        return 'Required'
    }
    if (content.length < 10) {
        return 'That joke is too short';
    }
}

export function validateJokeName(name: string) {
    if (!name) {
        return 'Required'
    }
    if (name.length < 3) {
        return `That joke's name is too short`;
    }
}

export function validateUsername(username: string) {
    if (!username) {
        return 'Required'
    }
    if (username.length < 3) {
        return 'Usernames must be at least 3 characters long';
    }
}

export function validatePassword(password: string) {
    if (!password) {
        return 'Required'
    }
    if (password.length < 6) {
        return 'Passwords must be at least 6 characters long';
    }
}

export function validateUrl(url: string) {
    const validUrls = ['/jokes', '/', 'https://remix.run'];
    if (validUrls.includes(url)) {
        return url
    }

    return validUrls[0]
}