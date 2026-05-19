import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Command as CommandPrimitive } from "cmdk";

import "../../styles/Command.css";

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className = "", ...props }, ref) => (
  <CommandPrimitive ref={ref} className={`command ${className}`.trim()} {...props} />
));
Command.displayName = "Command";

const CommandDialog = ({
  children,
  title = "Recherche globale",
  description = "Rechercher dans les conseils, commentaires, utilisateurs et themes publics.",
  ...props
}: DialogPrimitive.DialogProps & { title?: string; description?: string }) => (
  <DialogPrimitive.Root {...props}>
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="command-dialog-overlay" />
      <DialogPrimitive.Content className="command-dialog-content">
        <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
        <DialogPrimitive.Description className="sr-only">{description}</DialogPrimitive.Description>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>
);

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className = "", ...props }, ref) => (
  <CommandPrimitive.Input ref={ref} className={`command-input ${className}`.trim()} {...props} />
));
CommandInput.displayName = "CommandInput";

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className = "", ...props }, ref) => (
  <CommandPrimitive.List ref={ref} className={`command-list ${className}`.trim()} {...props} />
));
CommandList.displayName = "CommandList";

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>(({ className = "", ...props }, ref) => (
  <CommandPrimitive.Empty ref={ref} className={`command-empty ${className}`.trim()} {...props} />
));
CommandEmpty.displayName = "CommandEmpty";

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className = "", ...props }, ref) => (
  <CommandPrimitive.Group ref={ref} className={`command-group ${className}`.trim()} {...props} />
));
CommandGroup.displayName = "CommandGroup";

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className = "", ...props }, ref) => (
  <CommandPrimitive.Item ref={ref} className={`command-item ${className}`.trim()} {...props} />
));
CommandItem.displayName = "CommandItem";

export { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList };
