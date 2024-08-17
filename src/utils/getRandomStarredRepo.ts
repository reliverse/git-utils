import process from "process";
import got, { type Response, HTTPError } from "got";
import kleur from "kleur";
import random from "random";

// Define types for GitHub API responses
interface GitHubRepo {
  owner: {
    login: string;
  };
  name: string;
}

// Helper function to validate user input
const validateUser = (user: string | undefined): string => {
  if (!user) {
    // console.log("Usage: `npx -q @reliverse/git-utils username`");
    console.log("Usage: `pnpm tsx src/utils/getRandomStarredRepo username`");
    process.exit(1);
  }

  if (!/^[a-zA-Z0-9-]+$/.test(user)) {
    console.error(kleur.red().bold("Invalid GitHub username."));
    process.exit(1);
  }

  return user;
};

// Function to fetch starred repositories for a specific page
const fetchStars = async (
  user: string,
  page: number,
): Promise<GitHubRepo[]> => {
  try {
    const response: Response<GitHubRepo[]> = await got<GitHubRepo[]>(
      `https://api.github.com/users/${user}/starred?page=${page}`,
      {
        responseType: "json",
      },
    );

    if (response.body.length === 0) {
      console.warn(
        kleur
          .yellow()
          .bold(`${user} doesn’t have any starred repositories yet.`),
      );
      process.exit(0);
    }

    return response.body;
  } catch (error) {
    return handleError(error, "Unable to get stars");
  }
};

// Function to fetch the total number of pages of starred repositories
const fetchRandomPage = async (user: string): Promise<number> => {
  try {
    const response: Response<string> = await got(
      `https://api.github.com/users/${user}/starred`,
    );
    const lastPageMatch =
      typeof response.headers.link === "string"
        ? /page=(\d+)>; rel="last"/.exec(response.headers.link)
        : null;

    // Safely handle the case where lastPageMatch might be null or undefined
    const totalPages = lastPageMatch?.[1] ? parseInt(lastPageMatch[1], 10) : 1;

    return random.int(1, totalPages);
  } catch (error) {
    return handleError(error, "Unable to get random page");
  }
};

// Centralized error handling
const handleError = (error: unknown, message: string): never => {
  if (error instanceof HTTPError) {
    console.error(
      kleur
        .red()
        .bold(
          `${message} (${error.response.statusCode} ${error.response.statusMessage})`,
        ),
    );
  } else if (error instanceof Error) {
    console.error(kleur.red().bold(`${message}: ${error.message}`));
  } else {
    console.error(kleur.red().bold(`${message}: Unknown error`));
  }
  process.exit(1);
};

// Main function
(async () => {
  const user = validateUser(process.argv[2]);

  try {
    const page = await fetchRandomPage(user);
    const stars = await fetchStars(user, page);
    const randomRepo =
      stars.length > 0 ? stars[random.int(0, stars.length - 1)] : undefined;

    if (randomRepo) {
      console.log(
        kleur
          .green()
          .bold(
            `https://github.com/${randomRepo.owner.login}/${randomRepo.name}`,
          ),
      );
    } else {
      console.warn(
        kleur.yellow().bold("No repositories found on the random page."),
      );
    }
  } catch (error) {
    handleError(error, "An unexpected error occurred");
  }
})().catch((error) => {
  handleError(error, "An unhandled error occurred");
});
