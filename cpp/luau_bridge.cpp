#include "luau_bridge.h"

#include <sstream>

#include "transpiler/TuesdayEmitter.h"

namespace {

std::string EscapeJsonString(const std::string& value) {
  std::ostringstream stream;

  for (const char character : value) {
    switch (character) {
      case '\\':
        stream << "\\\\";
        break;
      case '"':
        stream << "\\\"";
        break;
      case '\n':
        stream << "\\n";
        break;
      case '\r':
        stream << "\\r";
        break;
      case '\t':
        stream << "\\t";
        break;
      default:
        stream << character;
        break;
    }
  }

  return stream.str();
}

bool HasBalancedParentheses(const std::string& source) {
  int depth = 0;

  for (const char character : source) {
    if (character == '(') {
      depth += 1;
    }

    if (character == ')') {
      depth -= 1;

      if (depth < 0) {
        return false;
      }
    }
  }

  return depth == 0;
}

std::size_t CountKeyword(const std::string& source, const std::string& keyword) {
  std::size_t count = 0;
  std::size_t offset = 0;

  while ((offset = source.find(keyword, offset)) != std::string::npos) {
    count += 1;
    offset += keyword.size();
  }

  return count;
}

}  // namespace

namespace moe {

CompileResult CompileLuauToTuesdayJson(const std::string& source) {
  const std::size_t openingBlocks =
      CountKeyword(source, "function") + CountKeyword(source, "if ") +
      CountKeyword(source, "for ") + CountKeyword(source, "while ");
  const std::size_t closingBlocks = CountKeyword(source, "end");

  if (openingBlocks > closingBlocks) {
    return {.ok = false,
            .json = "",
            .error = "Fallback Luau bridge detected a missing `end` token"};
  }

  if (!HasBalancedParentheses(source)) {
    return {.ok = false,
            .json = "",
            .error = "Fallback Luau bridge detected unbalanced parentheses"};
  }

  const std::string emittedBase = EmitEmptyTuesdayProject();
  const std::string payload =
      "{\"ok\":true,\"compiler\":\"fallback-cpp-luau-bridge\",\"source\":\"" +
      EscapeJsonString(source) + "\",\"tuesday\":" + emittedBase + "}";

  return {.ok = true, .json = payload, .error = ""};
}

}  // namespace moe
