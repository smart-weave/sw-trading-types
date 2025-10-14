# Examples Directory

This directory contains comprehensive documentation and examples for the `@smart-weave/sw-trading-types` package.

## 📚 Documentation Files

### [QUICKSTART.md](./QUICKSTART.md)
**Start here!** Get up and running with position performance management in 5 minutes.
- Quick implementation guide
- Essential code snippets
- Common patterns
- Troubleshooting tips

### [performance-management.md](./performance-management.md)
**Comprehensive guide** with detailed examples for both platforms.
- Firebase Functions implementation
- Next.js client implementation
- React hooks and components
- Error handling strategies
- Testing approaches
- Performance dashboard examples

### [ARCHITECTURE.md](./ARCHITECTURE.md)
**Deep dive** into the system design and technical decisions.
- Architecture overview
- Design patterns explained
- Trade-offs and limitations
- Future improvements
- Integration patterns
- Security considerations
- Performance optimization

## 🚀 Quick Navigation

**I want to...**

- ✅ **Get started quickly** → [QUICKSTART.md](./QUICKSTART.md)
- 🔧 **See detailed examples** → [performance-management.md](./performance-management.md)
- 🏗️ **Understand the architecture** → [ARCHITECTURE.md](./ARCHITECTURE.md)
- 📦 **Learn about the package** → [Main README](../README.md)

## 📖 Learning Path

### For Developers
1. Start with [QUICKSTART.md](./QUICKSTART.md) to get your first integration working
2. Review [performance-management.md](./performance-management.md) for your specific use case
3. Reference [ARCHITECTURE.md](./ARCHITECTURE.md) when you need to understand how things work

### For Architects
1. Read [ARCHITECTURE.md](./ARCHITECTURE.md) to understand the system design
2. Check [performance-management.md](./performance-management.md) for integration patterns
3. Use [QUICKSTART.md](./QUICKSTART.md) as a reference for implementation

## 🎯 What's Inside

### Performance Management System

The examples cover a framework-agnostic performance tracking system that works with both:
- **Next.js** (Firestore Web SDK)
- **Firebase Functions** (Firebase Admin SDK)

**Key Features:**
- Multi-period tracking (daily, weekly, monthly, yearly, overall)
- Comprehensive statistics (win rate, P/L ratios, etc.)
- Real-time updates
- Type-safe implementation
- Easy testing

### Core Components

```typescript
// Types
- PerformancePeriod
- PositionLiquidationInfo
- PerformanceRecord
- PerformanceStats
- PerformanceCRUD

// Functions
- processPositionLiquidation()
```

## 💡 Common Use Cases

### Use Case 1: Automatic Performance Tracking
When positions are liquidated in Firebase Functions, automatically update performance stats.

**See:** [performance-management.md → Firebase Functions Implementation](./performance-management.md#firebase-functions-implementation)

### Use Case 2: Real-time Dashboard
Display live performance metrics in your Next.js application.

**See:** [performance-management.md → Performance Monitoring Dashboard](./performance-management.md#performance-monitoring-dashboard)

### Use Case 3: Historical Analysis
Query and compare performance across different time periods.

**See:** [performance-management.md → Reading Performance Data](./performance-management.md#reading-performance-data)

## 🔍 Code Examples

All examples are production-ready and follow best practices:

- ✅ TypeScript with full type safety
- ✅ Error handling
- ✅ Real-world patterns
- ✅ Testing strategies
- ✅ Performance optimizations

## 🤝 Contributing

Found an issue or want to improve the examples?

1. Open an issue: [GitHub Issues](https://github.com/smart-weave/sw-trading-types/issues)
2. Submit a PR with improvements
3. Share your use case to help others

## 📄 License

MIT - See [LICENSE](../LICENSE) file for details.

---

**Happy coding!** 🚀

For the main package documentation, see [README.md](../README.md)
