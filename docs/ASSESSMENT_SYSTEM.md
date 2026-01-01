# Unified Assessment System

## Overview
All categories (Services, Apps, Operating Systems, Hardware) use a standardized assessment framework to evaluate technologies based on privacy, autonomy, and transparency principles.

## Scoring Dimensions

### 1. Privacy (0-4 scale)
Measures data protection and user privacy features.

**Scoring:**
- **4**: End-to-end encryption, no tracking, no telemetry, strong privacy by default
- **3**: Good privacy features, minimal tracking, opt-out telemetry
- **2**: Moderate privacy, some tracking, opt-in telemetry
- **1**: Limited privacy features, significant tracking
- **0**: Poor privacy, extensive tracking, data monetization

### 2. Autonomy (0-4 scale)
Measures user control and independence from vendor lock-in.

**Scoring:**
- **4**: Full control, self-hostable, federated, no vendor lock-in, strong data portability
- **3**: Good control, portable data, alternative options available
- **2**: Moderate control, limited portability, some vendor dependencies
- **1**: Limited control, vendor dependencies, weak portability
- **0**: No control, complete vendor lock-in, no data portability

### 3. Transparency (0-4 scale)
Measures openness and transparency of the technology.

**Scoring:**
- **4**: Fully open source, transparent governance, public roadmap, community-driven
- **3**: Mostly open source, transparent practices, documented processes
- **2**: Partially open, some transparency, limited documentation
- **1**: Mostly closed, minimal transparency
- **0**: Completely closed, opaque operations

### 4. Governance (0-4 scale)
Measures organizational structure and decision-making processes.

**Scoring:**
- **4**: Foundation/cooperative, community governance, democratic decision-making
- **3**: Foundation-backed, stakeholder input, transparent leadership
- **2**: Corporate with community input, some transparency
- **1**: Corporate-controlled, limited community voice
- **0**: Corporate-controlled, no community input, opaque governance

### 5. Overall (0-4 scale)
Composite score representing the overall assessment.

**Calculation:**
Average of the four dimensions, rounded to nearest integer, or manually set based on holistic assessment.

## Assessment Tiers

### Tier A: Sovereign
Technologies that maximize user sovereignty, privacy, and control.
- Typical score range: Overall 3.5-4.0
- Examples: Self-hosted open source with strong privacy

### Tier B: Aligned
Technologies aligned with privacy and autonomy principles with minor trade-offs.
- Typical score range: Overall 2.5-3.4
- Examples: Privacy-focused services with good practices

### Tier C: Transitional
Technologies with significant trade-offs but usable with awareness.
- Typical score range: Overall 1.5-2.4
- Examples: Mainstream services with some privacy features

### Tier D: Extractive
Technologies that prioritize data extraction and surveillance.
- Typical score range: Overall 0-1.4
- Examples: Data-harvesting platforms

## Recommendation Guidelines

### Recommended
Technologies with minimal privacy/autonomy trade-offs. Suitable for most users.
- Typically Tier A or high Tier B
- Strong scores across all dimensions

### Situational
Technologies with trade-offs that may be acceptable in specific contexts.
- Typically Tier B or C
- Good in some dimensions, weaker in others
- Requires user awareness of trade-offs

### Avoid
Technologies with significant privacy/autonomy concerns.
- Typically Tier D or low Tier C
- Poor scores across multiple dimensions
- Better alternatives available

### Compare Only
Listed for comparison purposes, not recommended for use.
- Any tier
- Educational value in understanding alternatives

## Migration Notes

### Operating Systems
Previous scoring dimensions have been mapped to the standard framework:
- `control_ownership` → `autonomy` (focus on user control)
- `resilience` → `privacy` (focus on protection from coercion/surveillance)
- `human_impact` → `governance` (focus on organizational structure)

Existing scores should be migrated using this mapping.

## Category-Specific Notes

### Services
- Platform support tracked separately
- Split between client and server open source evaluation

### Apps
- Focus on end-user application features
- Platform availability important for autonomy

### Operating Systems
- Kernel type and governance model crucial
- Bootloader unlockability significant for autonomy
- Ecosystem dependencies affect privacy score

### Hardware
- Physical repairability affects autonomy
- Firmware openness affects transparency
- Supply chain considerations in governance
