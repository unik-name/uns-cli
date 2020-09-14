# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

### Changed

-   get nft mint fee from milestone (#2978)
-   choose corresponding issuer for URL checker service (#2915)

### Removed

## 4.2.0 - 2020-09-03

### Added

-   add `unik:everlasting` command (#2902)
-   add `properties:verify` command for property verification (#2866)
-   add `properties:register` command for url verification jwt generation (#2328)
-   add `badges:claim` command for pioneer badge (#2430)

## 4.1.0 - 2020-07-15

### Added

-   add `text` flag on send command (#2834)

### Changed

-   dependencies upgrade, use circle-ci node 12 image, force minimum engine version to 12 (#2874)

### Removed

-   unused dependencies (patch-package, request, request-promise, tslib) and dev dependencies (@types/request-promise) (#2874)

## 4.0.0 - 2020-06-19

### Added

-   add `coupon` flag on `unik:create` command to create unik with a coupon code instead of `unik-voucher` (#2774)
-   add crypto account balance on `unik:read` command (#2800)

### Changed

-   vote for a delegate is now restricted to an `Alive` @unikname (#2725)
