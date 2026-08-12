# Florii development

Florii uses the same simulation engine in production, demonstrations, and automated checks. The accelerated test clock exists only to keep development feedback fast; it is not intended as a normal garden setting.

## Commands

```bash
npm run dev             # MCP server from TypeScript
npm run garden          # local viewer from TypeScript
npm run build           # strict TypeScript compilation
npm test                # engine, persistence, weather, dashboard, and MCP integration
npm run test:coverage   # Node's experimental coverage report
npm run check           # build + all tests
```

## Test time scale

The internal `test` pace advances one garden day every five seconds. Accelerated clocks always use simulated weather so a single real-world day is not replayed across many garden days.

Use a separate `FLORII_DATA_DIR` while developing so a long-lived garden is never accelerated accidentally.

## Integration coverage

The MCP integration test launches the compiled STDIO server, completes a real MCP handshake, lists tools, plants a named seed, and visits the resulting garden. Other tests cover elapsed-time resolution, persistence and locking, weather fallbacks, ecology, species variation, interactions, and the read-only dashboard.
