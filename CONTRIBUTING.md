# Contributing to Nest Microservices

First off, thanks for taking the time to contribute! 🎉

Nest Microservices is a community-driven project, and we welcome contributions of all forms—whether it's fixing bugs, improving documentation, or proposing new features.

## 📜 Code of Conduct

We are committed to providing a friendly, safe, and welcoming environment for all, regardless of gender, sexual orientation, disability, ethnicity, religion, or similar personal characteristic.

By participating in this project, you agree to abide by our Code of Conduct:
- **Be respectful and inclusive.**
- **No harassment or discrimination.**
- **Constructive feedback only.**

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18 or higher
- **pnpm**: v9.0.0+ (`npm install -g pnpm`)
- **Docker**: For running infrastructure (Postgres, RabbitMQ, etc.)

### Installation
1.  **Fork the repository** on GitHub.
2.  **Clone your fork** locally:
    ```bash
    git clone https://github.com/YOUR-USERNAME/nest-microservices.git
    cd nest-microservices
    ```
3.  **Install dependencies**:
    ```bash
    pnpm install
    ```
4.  **Start Infrastructure**:
    ```bash
    docker-compose -f docker-compose.local.yml up -d
    ```
5.  **Start Development Server**:
    ```bash
    pnpm dev
    ```

## 🛠 Development Workflow

### Project Structure
All detailed architectural and development guidelines are documented in **[GUIDELINES.md](./GUIDELINES.md)**. Please read this before writing any code.

### Branching Strategy
- **`main`**: The production-ready branch.
- **Feature Branches**: Create a new branch for every feature or bug fix.
    ```bash
    git checkout -b feature/my-new-feature
    # or
    git checkout -b fix/issue-123
    ```

### Making Changes
1.  **Follow the Style Guide**: We use `prettier` and `eslint`. Ensure your editor is configured to format on save, or run:
    ```bash
    pnpm turbo lint
    pnpm turbo format
    ```
2.  **Modular Development**: If you are working on a specific service (e.g., `auth`), you can run only that service to save resources:
    ```bash
    pnpm --filter auth dev
    ```
3.  **Shared Libraries**: If you modify `packages/*`, remember that these changes affect multiple services. Run the full build to check for regressions:
    ```bash
    pnpm build
    ```

## 🧪 Testing
- **Unit Tests**: Write unit tests for all new business logic.
    ```bash
    pnpm test
    ```
- **E2E Tests**: Ensure end-to-end flows remain functional.

## 📝 Pull Request Process

1.  **Update Documentation**: If you changed APIs or configuration, update `README.md` or `GUIDELINES.md`.
2.  **Verify Build**: Ensure the project builds without errors.
    ```bash
    pnpm build
    ```
3.  **Push Changes**: Push your branch to your fork.
4.  **Open a PR**: Submit a Pull Request to the `main` branch.
    - Title should be descriptive (e.g., "feat(auth): add google oauth support").
    - Provide a clear description of the changes.
    - Link to any relevant issues.

## 🐛 Reporting Bugs

If you find a bug, please create an issue on GitHub with:
- **Description**: What happened?
- **Reproduction Steps**: How can we see it?
- **Expected Behavior**: What should have happened?
- **Environment**: OS, Node version, etc.

---

**Thank you for contributing to Nest Microservices! 🦅**
