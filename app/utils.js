export const boldSubstring = (inputString, substring) => {
  // Split the substring into parts
  const substrings = substring.split(" ").filter((part) => part.length > 0);

  // Create a regular expression to match any of the substrings
  const regex = new RegExp(`(${substrings.join("|")})`, "gi");

  // Split the inputString using the regex and map the parts
  const parts = inputString.split(regex);
  return parts.map((part, index) => {
    if (substrings.some((sub) => sub.toLowerCase() === part.toLowerCase())) {
      return (
        <strong key={index} className="font-bold">
          {part}
        </strong>
      );
    } else {
      return part;
    }
  });
};
